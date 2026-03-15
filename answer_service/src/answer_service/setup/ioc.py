from collections import deque
from collections.abc import Iterable
from typing import Final

from bazario.asyncio import Dispatcher, Publisher, Registry
from bazario.asyncio.resolvers.dishka import DishkaResolver
from chromadb.api import ClientAPI
from dishka import AsyncContainer, Provider, Scope
from faststream.rabbit import RabbitBroker
from langchain_chroma import Chroma
from langchain_core.embeddings import Embeddings
from langchain_openai import ChatOpenAI
from sqlalchemy.ext.asyncio import AsyncSession

from answer_service.application.commands.conversation.ask_question import AskQuestionCommandHandler
from answer_service.application.commands.outbox.relay_outbox import RelayOutboxCommandHandler
from answer_service.application.common.ports.outbox_publisher import OutboxPublisher
from answer_service.application.commands.conversation.close_conversation import CloseConversationCommandHandler
from answer_service.application.commands.conversation.create_conversation import CreateConversationCommandHandler
from answer_service.application.commands.lesson_index.index_lesson import IndexLessonCommandHandler
from answer_service.application.commands.lesson_index.reindex_lesson import ReindexLessonCommandHandler
from answer_service.application.commands.user.create_user import CreateUserCommandHandler
from answer_service.application.commands.user.delete_user import DeleteUserCommandHandler
from answer_service.application.common.ports.conversation_repository import ConversationRepository
from answer_service.application.common.ports.embedding_port import EmbeddingPort
from answer_service.application.common.ports.event_bus import EventBus
from answer_service.application.common.ports.lesson_index_repository import LessonIndexRepository
from answer_service.application.common.ports.llm_port import LLMPort
from answer_service.application.common.ports.outbox_repository import OutboxRepository
from answer_service.application.common.ports.transaction_manager import TransactionManager
from answer_service.application.common.ports.user_repository import UserRepository
from answer_service.application.common.ports.vector_search_port import VectorSearchPort
from answer_service.application.queries.conversation.get_conversation import GetConversationQueryHandler
from answer_service.application.queries.conversation.get_conversations import GetConversationsQueryHandler
from answer_service.application.queries.lesson_index.get_lesson_index_status import GetLessonIndexStatusQueryHandler
from answer_service.application.queries.user.get_user_by_id import GetUserByIdQueryHandler
from answer_service.application.queries.user.get_users import GetUsersQueryHandler
from answer_service.domain.common.events_collection import EventsCollection
from answer_service.domain.conversation.factories.conversation_factory import ConversationFactory
from answer_service.domain.conversation.ports.id_generator import (
    ConversationIdGenerator,
    MessageIdGenerator,
)
from answer_service.domain.conversation.services.context_window_service import ContextWindowService
from answer_service.domain.lesson_index.factories.lesson_index_factory import LessonIndexFactory
from answer_service.domain.lesson_index.ports.id_generator import ChunkIdGenerator
from answer_service.domain.lesson_index.services.text_splitter_service import TextSplitterService
from answer_service.infrastructure.adapters.common.bazario_event_bus import BazarioEventBus
from answer_service.infrastructure.adapters.common.uuid4_chunk_id_generator import UUID4ChunkIdGenerator
from answer_service.infrastructure.adapters.common.uuid4_conversation_id_generator import UUID4ConversationIdGenerator
from answer_service.infrastructure.adapters.common.uuid4_message_id_generator import UUID4MessageIdGenerator
from answer_service.infrastructure.adapters.langchain.embedding import LangChainEmbeddingPort
from answer_service.infrastructure.adapters.langchain.openai_llm import LangChainOpenAILLMPort
from answer_service.infrastructure.adapters.persistence.chroma_vector_search import ChromaVectorSearchPort
from answer_service.infrastructure.mappers.llm_mapper import LLMRequestMapper, LLMResponseMapper
from answer_service.infrastructure.mappers.vector_search_mapper import VectorSearchResultMapper
from answer_service.infrastructure.adapters.persistence.sqlalchemy_conversation_repository import (
    SqlAlchemyConversationRepository,
)
from answer_service.infrastructure.adapters.persistence.sqlalchemy_lesson_index_repository import (
    SqlAlchemyLessonIndexRepository,
)
from answer_service.infrastructure.adapters.persistence.sqlalchemy_transaction_manager import (
    SqlAlchemyTransactionManager,
)
from answer_service.infrastructure.adapters.persistence.sqlalchemy_user_repository import (
    SqlAlchemyUserRepository,
)
from answer_service.infrastructure.adapters.messaging.faststream_outbox_publisher import FastStreamOutboxPublisher
from answer_service.infrastructure.outbox.event_serializer import EventSerializer
from answer_service.infrastructure.outbox.sqlalchemy_outbox_repository import SqlAlchemyOutboxRepository
from answer_service.infrastructure.persistence.chroma_provider import (
    create_chat_openai,
    create_chroma_client,
    create_chroma_vectorstore,
    create_embedding_function,
)
from answer_service.infrastructure.persistence.provider import get_engine, get_session, get_sessionmaker
from answer_service.setup.configs.asgi_config import ASGIConfig
from answer_service.setup.configs.broker_config import RabbitConfig
from answer_service.setup.configs.chroma_config import ChromaConfig
from answer_service.setup.configs.database_config import PostgresConfig, SQLAlchemyConfig
from answer_service.setup.configs.llm_config import OpenAIConfig


def _make_events_collection() -> EventsCollection:
    return EventsCollection(events=deque())


def configs_provider() -> Provider:
    provider: Final[Provider] = Provider(scope=Scope.APP)
    provider.from_context(provides=ASGIConfig)
    provider.from_context(provides=PostgresConfig)
    provider.from_context(provides=SQLAlchemyConfig)
    provider.from_context(provides=ChromaConfig)
    provider.from_context(provides=OpenAIConfig)
    return provider


def db_provider() -> Provider:
    provider: Final[Provider] = Provider(scope=Scope.REQUEST)
    provider.provide(get_engine, scope=Scope.APP)
    provider.provide(get_sessionmaker, scope=Scope.APP)
    provider.provide(get_session, provides=AsyncSession)
    return provider


def vector_store_provider() -> Provider:
    """APP-scoped: Chroma client, embedding function, vectorstore, and ChatOpenAI."""
    provider: Final[Provider] = Provider(scope=Scope.APP)
    provider.provide(create_embedding_function, provides=Embeddings)
    provider.provide(create_chroma_client, provides=ClientAPI)
    provider.provide(create_chroma_vectorstore, provides=Chroma)
    provider.provide(create_chat_openai, provides=ChatOpenAI)
    return provider


def bazario_provider() -> Provider:
    """APP-scoped Bazario registry and in-process event dispatcher."""
    provider: Final[Provider] = Provider(scope=Scope.APP)
    registry: Final[Registry] = Registry()

    async def _make_dispatcher(container: AsyncContainer) -> Dispatcher:
        resolver = DishkaResolver(container)
        return Dispatcher(resolver=resolver, registry=registry)

    provider.provide(lambda: registry, provides=Registry)
    provider.provide(_make_dispatcher, provides=Publisher)
    return provider


def broker_provider() -> Provider:
    """APP-scoped FastStream RabbitMQ broker."""
    provider: Final[Provider] = Provider(scope=Scope.APP)

    async def _make_rabbit_broker(config: RabbitConfig) -> RabbitBroker:
        broker = RabbitBroker(config.uri)
        await broker.connect()
        return broker

    provider.provide(_make_rabbit_broker, provides=RabbitBroker)
    return provider


def domain_ports_provider() -> Provider:
    """ID generators, domain factories, and stateless domain services."""
    provider: Final[Provider] = Provider(scope=Scope.REQUEST)
    # One EventsCollection per request — shared across all aggregates.
    provider.provide(_make_events_collection, provides=EventsCollection)
    provider.provide(source=UUID4ConversationIdGenerator, provides=ConversationIdGenerator)
    provider.provide(source=UUID4MessageIdGenerator, provides=MessageIdGenerator)
    provider.provide(source=UUID4ChunkIdGenerator, provides=ChunkIdGenerator)
    provider.provide(source=ConversationFactory)
    provider.provide(source=LessonIndexFactory)
    provider.provide(source=ContextWindowService)
    provider.provide(source=TextSplitterService)
    return provider


def mappers_provider() -> Provider:
    """Infrastructure mappers for LangChain adapters (APP-scoped, stateless)."""
    provider: Final[Provider] = Provider(scope=Scope.APP)
    provider.provide(source=VectorSearchResultMapper)
    provider.provide(source=LLMRequestMapper)
    provider.provide(source=LLMResponseMapper)
    provider.provide(source=EventSerializer)
    return provider


def gateways_provider() -> Provider:
    """Repositories, transaction manager, and external service adapters."""
    provider: Final[Provider] = Provider(scope=Scope.REQUEST)
    provider.provide(source=SqlAlchemyTransactionManager, provides=TransactionManager)
    provider.provide(source=SqlAlchemyUserRepository, provides=UserRepository)
    provider.provide(source=SqlAlchemyConversationRepository, provides=ConversationRepository)
    provider.provide(source=SqlAlchemyLessonIndexRepository, provides=LessonIndexRepository)
    provider.provide(source=SqlAlchemyOutboxRepository, provides=OutboxRepository)
    provider.provide(source=ChromaVectorSearchPort, provides=VectorSearchPort)
    provider.provide(source=LangChainEmbeddingPort, provides=EmbeddingPort)
    provider.provide(source=LangChainOpenAILLMPort, provides=LLMPort)
    provider.provide(source=BazarioEventBus, provides=EventBus)
    return provider


def interactors_provider() -> Provider:
    provider: Final[Provider] = Provider(scope=Scope.REQUEST)
    provider.provide_all(
        CreateUserCommandHandler,
        DeleteUserCommandHandler,
        CreateConversationCommandHandler,
        AskQuestionCommandHandler,
        CloseConversationCommandHandler,
        IndexLessonCommandHandler,
        ReindexLessonCommandHandler,
        GetUserByIdQueryHandler,
        GetUsersQueryHandler,
        GetConversationQueryHandler,
        GetConversationsQueryHandler,
        GetLessonIndexStatusQueryHandler,
    )
    return provider


def setup_providers() -> Iterable[Provider]:
    return (
        configs_provider(),
        db_provider(),
        vector_store_provider(),
        bazario_provider(),
        mappers_provider(),
        domain_ports_provider(),
        gateways_provider(),
        interactors_provider(),
    )


def outbox_relay_provider() -> Provider:
    """REQUEST-scoped providers for the outbox relay worker task."""
    provider: Final[Provider] = Provider(scope=Scope.REQUEST)
    provider.provide(source=SqlAlchemyTransactionManager, provides=TransactionManager)
    provider.provide(source=SqlAlchemyOutboxRepository, provides=OutboxRepository)
    provider.provide(source=FastStreamOutboxPublisher, provides=OutboxPublisher)
    provider.provide(source=RelayOutboxCommandHandler)
    return provider


def setup_worker_providers() -> Iterable[Provider]:
    """Minimal providers for the taskiq worker process."""
    provider: Final[Provider] = Provider(scope=Scope.APP)
    provider.from_context(provides=PostgresConfig)
    provider.from_context(provides=SQLAlchemyConfig)
    provider.from_context(provides=RabbitConfig)

    return (
        provider,
        db_provider(),
        broker_provider(),
        outbox_relay_provider(),
    )
