"""Test-scoped Dishka provider functions for integration tests.

Mirrors ``src/answer_service/setup/ioc.py``:
  - individual ``*_provider()`` functions return a configured ``Provider``
  - composite functions return ``Iterable[Provider]`` for ``make_async_container``

Production providers are reused as-is; only the vector-store layer is swapped
for in-process test doubles so no real OpenAI / ChromaDB server is needed.
"""

from collections.abc import Iterable
from typing import Final, cast

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
    outbox_relay_provider,
)

_FAKE_LLM_RESPONSE: Final[str] = "Integration test answer."


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
    FakeChatModel).
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
    )


def outbox_worker_test_providers(
    engine: AsyncEngine,
    factory: async_sessionmaker[AsyncSession],
    rabbit_broker: RabbitBroker,
) -> Iterable[Provider]:
    """Minimal providers for the outbox relay worker task in tests.

    Mirrors ``setup_worker_providers()`` but accepts concrete engine / broker
    instances (resolved from the test's ``dishka_container``) instead of
    reading ``PostgresConfig`` / ``RabbitConfig`` from context.
    """
    infrastructure: Final[Provider] = Provider(scope=Scope.APP)
    infrastructure.provide(lambda: engine, provides=AsyncEngine)
    infrastructure.provide(lambda: factory, provides=async_sessionmaker)

    broker_prov: Final[Provider] = Provider(scope=Scope.APP)
    broker_prov.provide(lambda: rabbit_broker, provides=RabbitBroker)

    session_prov: Final[Provider] = Provider(scope=Scope.REQUEST)
    session_prov.provide(get_session, provides=AsyncSession)

    return infrastructure, broker_prov, session_prov, outbox_relay_provider()
