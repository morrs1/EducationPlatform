from collections import deque
from collections.abc import Iterable
from typing import Final

from bazario.asyncio import Dispatcher, Registry
from bazario.asyncio.resolvers.dishka import DishkaResolver
from chromadb.api import ClientAPI
from dishka import Provider, Scope, WithParents
from dishka.integrations.fastapi import FastapiProvider
from dishka.integrations.taskiq import TaskiqProvider
from dishka_faststream import FastStreamProvider
from faststream.rabbit import RabbitBroker
from langchain_chroma import Chroma
from langchain_core.embeddings import Embeddings
from langchain_openai import ChatOpenAI
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession
from taskiq import AsyncBroker

from answer_service.application.commands.conversation.ask_question import (
    AskQuestionCommandHandler,
)
from answer_service.application.commands.conversation.close_conversation import (
    CloseConversationCommandHandler,
)
from answer_service.application.commands.conversation.create_conversation import (
    CreateConversationCommandHandler,
)
from answer_service.application.commands.inbox.check_inbox import CheckInboxCommandHandler
from answer_service.application.commands.lesson_index.index_lesson import (
    IndexLessonCommandHandler,
)
from answer_service.application.commands.lesson_index.reindex_lesson import (
    ReindexLessonCommandHandler,
)
from answer_service.application.commands.lesson_index.schedule_index_lesson import (
    ScheduleIndexLessonCommandHandler,
)
from answer_service.application.commands.lesson_index.schedule_reindex_lesson import (
    ScheduleReindexLessonCommandHandler,
)
from answer_service.application.commands.outbox.relay_outbox import (
    RelayOutboxCommandHandler,
)
from answer_service.application.commands.user.create_user import CreateUserCommandHandler
from answer_service.application.commands.user.delete_user import DeleteUserCommandHandler
from answer_service.application.common.ports.conversation_repository import (
    ConversationRepository,
)
from answer_service.application.common.ports.embedding_port import EmbeddingPort
from answer_service.application.common.ports.event_bus import EventBus
from answer_service.application.common.ports.event_serializer import EventSerializer
from answer_service.application.common.ports.inbox_repository import InboxRepository
from answer_service.application.common.ports.lesson_index_repository import (
    LessonIndexRepository,
)
from answer_service.application.common.ports.llm_port import LLMPort
from answer_service.application.common.ports.outbox_publisher import OutboxPublisher
from answer_service.application.common.ports.outbox_repository import OutboxRepository
from answer_service.application.common.ports.scheduler.task_scheduler import (
    TaskScheduler,
)
from answer_service.application.common.ports.transaction_manager import TransactionManager
from answer_service.application.common.ports.user_repository import UserRepository
from answer_service.application.common.ports.vector_search_port import VectorSearchPort
from answer_service.application.queries.conversation.get_conversation import (
    GetConversationQueryHandler,
)
from answer_service.application.queries.conversation.get_conversations import (
    GetConversationsQueryHandler,
)
from answer_service.application.queries.lesson_index.get_lesson_index_status import (
    GetLessonIndexStatusQueryHandler,
)
from answer_service.application.queries.user.get_user_by_id import GetUserByIdQueryHandler
from answer_service.application.queries.user.get_users import GetUsersQueryHandler
from answer_service.domain.common.events_collection import EventsCollection
from answer_service.domain.conversation.factories.conversation_factory import (
    ConversationFactory,
)
from answer_service.domain.conversation.ports.id_generator import (
    ConversationIdGenerator,
    MessageIdGenerator,
)
from answer_service.domain.conversation.services.context_window_service import (
    ContextWindowService,
)
from answer_service.domain.lesson_index.factories.lesson_index_factory import (
    LessonIndexFactory,
)
from answer_service.domain.lesson_index.ports.id_generator import ChunkIdGenerator
from answer_service.domain.lesson_index.services.text_splitter_service import (
    TextSplitterService,
)
from answer_service.infrastructure.adapters.common import (
    BazarioEventBus,
    UUID4ChunkIdGenerator,
    UUID4ConversationIdGenerator,
    UUID4MessageIdGenerator,
)
from answer_service.infrastructure.adapters.langchain.embedding import (
    LangChainEmbeddingPort,
)
from answer_service.infrastructure.adapters.langchain.openai_llm import (
    LangChainOpenAILLMPort,
)
from answer_service.infrastructure.adapters.messaging.faststream_outbox_publisher import (
    FastStreamOutboxPublisher,
)
from answer_service.infrastructure.adapters.persistence import (
    ChromaVectorSearchPort,
    SqlAlchemyConversationRepository,
    SqlAlchemyInboxRepository,
    SqlAlchemyLessonIndexRepository,
    SqlAlchemyOutboxRepository,
    SqlAlchemyTransactionManager,
    SqlAlchemyUserRepository,
)
from answer_service.infrastructure.cache.provider import get_redis
from answer_service.infrastructure.mappers.event_serializer import RetortEventSerializer
from answer_service.infrastructure.mappers.llm_mapper import (
    LLMRequestMapper,
    LLMResponseMapper,
)
from answer_service.infrastructure.mappers.vector_search_mapper import (
    VectorSearchResultMapper,
)
from answer_service.infrastructure.persistence.chroma_provider import (
    create_chat_openai,
    create_chroma_client,
    create_chroma_vectorstore,
    create_embedding_function,
)
from answer_service.infrastructure.persistence.provider import (
    get_engine,
    get_session,
    get_sessionmaker,
)
from answer_service.infrastructure.scheduler.task_iq_scheduler import TaskIQTaskScheduler
from answer_service.setup.bootstrap import setup_schedule_source
from answer_service.setup.configs.asgi_config import ASGIConfig
from answer_service.setup.configs.broker_config import RabbitConfig
from answer_service.setup.configs.chroma_config import ChromaConfig
from answer_service.setup.configs.database_config import PostgresConfig, SQLAlchemyConfig
from answer_service.setup.configs.llm_config import OpenAIConfig
from answer_service.setup.configs.redis_config import RedisConfig


def configs_provider() -> Provider:
    provider: Final[Provider] = Provider(scope=Scope.APP)
    provider.from_context(provides=ASGIConfig)
    provider.from_context(provides=PostgresConfig)
    provider.from_context(provides=SQLAlchemyConfig)
    provider.from_context(provides=ChromaConfig)
    provider.from_context(provides=OpenAIConfig)
    provider.from_context(provides=RabbitConfig)
    provider.from_context(provides=RedisConfig)
    provider.from_context(provides=RabbitBroker)
    provider.from_context(provides=AsyncBroker)
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


def _make_registry() -> Registry:
    return Registry()


def bazario_provider() -> Provider:
    """REQUEST-scoped Bazario resolver and dispatcher; APP-scoped registry."""
    provider: Final[Provider] = Provider(scope=Scope.REQUEST)
    provider.provide(_make_registry, provides=Registry, scope=Scope.APP)
    provider.provide(WithParents[DishkaResolver])
    provider.provide(WithParents[Dispatcher])
    return provider


def _make_events_collection() -> EventsCollection:
    return EventsCollection(events=deque())


def domain_ports_provider() -> Provider:
    """ID generators, domain factories, and stateless domain services."""
    provider: Final[Provider] = Provider(scope=Scope.REQUEST)
    # One EventsCollection per request — shared across all aggregates.
    provider.provide(_make_events_collection, provides=EventsCollection)
    provider.provide(
        source=UUID4ConversationIdGenerator, provides=ConversationIdGenerator
    )
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
    provider.provide(source=RetortEventSerializer, provides=EventSerializer)
    return provider


def gateways_provider() -> Provider:
    """Repositories, transaction manager, and external service adapters."""
    provider: Final[Provider] = Provider(scope=Scope.REQUEST)
    provider.provide(source=SqlAlchemyTransactionManager, provides=TransactionManager)
    provider.provide(source=SqlAlchemyUserRepository, provides=UserRepository)
    provider.provide(
        source=SqlAlchemyConversationRepository, provides=ConversationRepository
    )
    provider.provide(
        source=SqlAlchemyLessonIndexRepository, provides=LessonIndexRepository
    )
    provider.provide(source=SqlAlchemyInboxRepository, provides=InboxRepository)
    provider.provide(source=SqlAlchemyOutboxRepository, provides=OutboxRepository)
    provider.provide(source=FastStreamOutboxPublisher, provides=OutboxPublisher)
    provider.provide(source=ChromaVectorSearchPort, provides=VectorSearchPort)
    provider.provide(source=LangChainEmbeddingPort, provides=EmbeddingPort)
    provider.provide(source=LangChainOpenAILLMPort, provides=LLMPort)
    provider.provide(source=BazarioEventBus, provides=EventBus)
    return provider


def interactors_provider() -> Provider:
    provider: Final[Provider] = Provider(scope=Scope.REQUEST)
    provider.provide_all(
        CheckInboxCommandHandler,
        CreateUserCommandHandler,
        DeleteUserCommandHandler,
        CreateConversationCommandHandler,
        AskQuestionCommandHandler,
        CloseConversationCommandHandler,
        IndexLessonCommandHandler,
        ReindexLessonCommandHandler,
        ScheduleIndexLessonCommandHandler,
        ScheduleReindexLessonCommandHandler,
        RelayOutboxCommandHandler,
        GetUserByIdQueryHandler,
        GetUsersQueryHandler,
        GetConversationQueryHandler,
        GetConversationsQueryHandler,
        GetLessonIndexStatusQueryHandler,
    )
    return provider


def cache_provider() -> Provider:
    """APP-scoped Redis client managed by Dishka (lifecycle via async generator)."""
    provider: Final[Provider] = Provider(scope=Scope.APP)
    provider.provide(get_redis, provides=Redis, scope=Scope.REQUEST)
    return provider


def scheduler_provider() -> Provider:
    """APP-scoped schedule source + REQUEST-scoped TaskIQ scheduler adapter."""
    provider: Final[Provider] = Provider(scope=Scope.REQUEST)
    provider.provide(
        source=setup_schedule_source,
        scope=Scope.APP,
    )
    provider.provide(source=TaskIQTaskScheduler, provides=TaskScheduler)
    return provider


def setup_providers() -> Iterable[Provider]:
    return (
        configs_provider(),
        db_provider(),
        cache_provider(),
        vector_store_provider(),
        bazario_provider(),
        mappers_provider(),
        domain_ports_provider(),
        gateways_provider(),
        interactors_provider(),
        scheduler_provider(),
        TaskiqProvider(),
        FastapiProvider(),
        FastStreamProvider(),
    )
