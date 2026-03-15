"""Test-scoped Dishka provider functions for integration tests.

Mirrors ``src/answer_service/setup/ioc.py``:
  - individual ``*_provider()`` functions return a configured ``Provider``
  - composite functions return ``Iterable[Provider]`` for ``make_async_container``

Production providers are reused as-is; only the vector-store layer is swapped
for in-process test doubles so no real OpenAI / ChromaDB server is needed.
"""

from collections.abc import Iterable
from typing import Any, Final, cast

import chromadb
from chromadb.api import ClientAPI
from dishka import Provider, Scope
from faststream.rabbit import RabbitBroker
from langchain_chroma import Chroma
from langchain_core.embeddings import Embeddings
from langchain_core.embeddings.fake import FakeEmbeddings
from langchain_core.language_models.fake_chat_models import FakeChatModel
from langchain_openai import ChatOpenAI
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker

from answer_service.application.commands.lesson_index.index_lesson import (
    IndexLessonCommandHandler,
)
from answer_service.application.commands.lesson_index.reindex_lesson import (
    ReindexLessonCommandHandler,
)
from answer_service.application.commands.outbox.relay_outbox import (
    RelayOutboxCommandHandler,
)
from answer_service.application.common.ports.embedding_port import EmbeddingPort
from answer_service.application.common.ports.event_bus import EventBus
from answer_service.application.common.ports.lesson_index_repository import (
    LessonIndexRepository,
)
from answer_service.application.common.ports.outbox_publisher import OutboxPublisher
from answer_service.application.common.ports.outbox_repository import OutboxRepository
from answer_service.application.common.ports.scheduler.task_id import (
    TaskID,
    TaskInfo,
    TaskKey,
)
from answer_service.application.common.ports.scheduler.task_scheduler import TaskScheduler
from answer_service.application.common.ports.transaction_manager import TransactionManager
from answer_service.application.common.ports.vector_search_port import VectorSearchPort
from answer_service.infrastructure.adapters.common import BazarioEventBus
from answer_service.infrastructure.adapters.langchain.embedding import (
    LangChainEmbeddingPort,
)
from answer_service.infrastructure.adapters.messaging.faststream_outbox_publisher import (
    FastStreamOutboxPublisher,
)
from answer_service.infrastructure.adapters.persistence import (
    ChromaVectorSearchPort,
    SqlAlchemyLessonIndexRepository,
    SqlAlchemyOutboxRepository,
    SqlAlchemyTransactionManager,
)
from answer_service.infrastructure.persistence.chroma_provider import (
    create_chroma_vectorstore,
)
from answer_service.infrastructure.persistence.provider import get_session
from answer_service.setup.ioc import (
    bazario_provider,
    configs_provider,
    db_provider,
    domain_ports_provider,
    gateways_provider,
    interactors_provider,
    mappers_provider,
)

_FAKE_LLM_RESPONSE: Final[str] = "Integration test answer."


class _TaskSchedulerStub:
    """No-op TaskScheduler for route integration tests — records task_id without executing."""

    def make_task_id(self, key: TaskKey, value: Any) -> TaskID:
        return TaskID(f"{key}:{value}")

    async def schedule(self, task_id: TaskID, payload: Any) -> None:
        pass

    async def read_task_info(self, task_id: TaskID) -> TaskInfo | None:  # noqa: ARG002
        return None


def test_scheduler_provider() -> Provider:
    """Provides a no-op TaskScheduler stub for route integration tests."""
    provider: Provider = Provider(scope=Scope.REQUEST)
    provider.provide(_TaskSchedulerStub, provides=TaskScheduler)
    return provider


def test_vector_store_provider() -> Provider:
    """Replaces ``vector_store_provider()`` with fast, in-process test doubles.

    FakeEmbeddings, EphemeralClient and FakeChatModel are injected into the
    *unchanged* real adapters (LangChainEmbeddingPort, ChromaVectorSearchPort,
    LangChainOpenAILLMPort), so the full adapter code is exercised.
    ``create_chroma_vectorstore`` is reused directly from ``chroma_provider.py``.
    """
    provider: Provider = Provider(scope=Scope.APP)

    def _embeddings() -> Embeddings:
        return FakeEmbeddings(size=1536)

    def _chroma_client() -> ClientAPI:
        return chromadb.EphemeralClient()

    def _chat_model() -> ChatOpenAI:
        return cast("ChatOpenAI", FakeChatModel(responses=[_FAKE_LLM_RESPONSE]))

    provider.provide(_embeddings, provides=Embeddings)
    provider.provide(_chroma_client, provides=ClientAPI)
    provider.provide(create_chroma_vectorstore, provides=Chroma)
    provider.provide(_chat_model, provides=ChatOpenAI)
    return provider


def test_app_providers() -> Iterable[Provider]:
    """All providers for the integration test container.

    Mirrors ``setup_providers()`` but swaps ``vector_store_provider()`` for
    ``test_vector_store_provider()`` (FakeEmbeddings, EphemeralClient,
    FakeChatModel) and replaces ``scheduler_provider()`` with a no-op stub.
    """
    return (
        configs_provider(),
        db_provider(),
        test_vector_store_provider(),
        bazario_provider(),
        mappers_provider(),
        domain_ports_provider(),
        gateways_provider(),
        interactors_provider(),
        test_scheduler_provider(),
    )


def outbox_worker_test_providers(
    engine: AsyncEngine,
    factory: async_sessionmaker[AsyncSession],
    rabbit_broker: RabbitBroker,
) -> Iterable[Provider]:
    """Minimal providers for the outbox relay worker task in tests.

    Mirrors the outbox relay slice of ``setup_worker_providers()`` but
    accepts concrete engine / broker instances (resolved from the test's
    ``dishka_container``) instead of reading configs from context.
    """
    infrastructure: Final[Provider] = Provider(scope=Scope.APP)
    infrastructure.provide(lambda: engine, provides=AsyncEngine)
    infrastructure.provide(lambda: factory, provides=async_sessionmaker)

    broker_prov: Final[Provider] = Provider(scope=Scope.APP)
    broker_prov.provide(lambda: rabbit_broker, provides=RabbitBroker)

    session_prov: Final[Provider] = Provider(scope=Scope.REQUEST)
    session_prov.provide(get_session, provides=AsyncSession)

    relay_prov: Final[Provider] = Provider(scope=Scope.REQUEST)
    relay_prov.provide(source=SqlAlchemyTransactionManager, provides=TransactionManager)
    relay_prov.provide(source=SqlAlchemyOutboxRepository, provides=OutboxRepository)
    relay_prov.provide(source=FastStreamOutboxPublisher, provides=OutboxPublisher)
    relay_prov.provide(source=RelayOutboxCommandHandler)

    return infrastructure, broker_prov, session_prov, relay_prov


def lesson_index_worker_test_providers(
    engine: AsyncEngine,
    factory: async_sessionmaker[AsyncSession],
    chroma: Chroma,
    embeddings: Embeddings,
) -> Iterable[Provider]:
    """Minimal providers for lesson index worker tasks in tests.

    Shares the same AsyncEngine and Chroma instance as the main test container
    so that tasks read/write the same PostgreSQL database and vector store.
    """
    infrastructure: Final[Provider] = Provider(scope=Scope.APP)
    infrastructure.provide(lambda: engine, provides=AsyncEngine)
    infrastructure.provide(lambda: factory, provides=async_sessionmaker)
    infrastructure.provide(lambda: chroma, provides=Chroma)
    infrastructure.provide(lambda: embeddings, provides=Embeddings)

    session_prov: Final[Provider] = Provider(scope=Scope.REQUEST)
    session_prov.provide(get_session, provides=AsyncSession)

    gw_prov: Final[Provider] = Provider(scope=Scope.REQUEST)
    gw_prov.provide(source=SqlAlchemyTransactionManager, provides=TransactionManager)
    gw_prov.provide(
        source=SqlAlchemyLessonIndexRepository, provides=LessonIndexRepository
    )
    gw_prov.provide(source=ChromaVectorSearchPort, provides=VectorSearchPort)
    gw_prov.provide(source=LangChainEmbeddingPort, provides=EmbeddingPort)
    gw_prov.provide(source=BazarioEventBus, provides=EventBus)

    lesson_prov: Final[Provider] = Provider(scope=Scope.REQUEST)
    lesson_prov.provide(source=IndexLessonCommandHandler)
    lesson_prov.provide(source=ReindexLessonCommandHandler)

    return (
        infrastructure,
        session_prov,
        bazario_provider(),
        mappers_provider(),
        domain_ports_provider(),
        gw_prov,
        lesson_prov,
    )
