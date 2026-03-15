"""Integration test configuration.

Session topology
────────────────
 PostgresContainer ─► PostgresConfig/SQLAlchemyConfig  ─┐
                                                          ├─► Dishka AsyncContainer
 test_vector_store_provider() (FakeEmbeddings, etc.)  ─┘
          │
    FastAPI App ─► AsyncClient (per test)

All providers from ioc.py are reused as-is.
Only vector_store_provider() is swapped for test doubles:
  • FakeEmbeddings        → LangChainEmbeddingPort (unchanged)
  • chromadb.EphemeralClient → ChromaVectorSearchPort (unchanged)
  • FakeChatModel         → LangChainOpenAILLMPort (unchanged)

Isolation
─────────
After every test:
  • PostgreSQL tables are TRUNCATED (CASCADE).
  • Chroma collection entries are deleted.
"""

import asyncio
import contextlib
import os
from collections.abc import AsyncGenerator, Generator
from typing import Final, cast

import chromadb
import pytest
from chromadb.api import ClientAPI
from dishka import AsyncContainer, Provider, Scope, make_async_container
from dishka.integrations.fastapi import setup_dishka
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from langchain_chroma import Chroma
from langchain_core.embeddings import Embeddings
from langchain_core.embeddings.fake import FakeEmbeddings
from langchain_core.language_models.fake_chat_models import FakeChatModel
from langchain_openai import ChatOpenAI
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine
from testcontainers.postgres import PostgresContainer

from answer_service.infrastructure.persistence.chroma_provider import (
    create_chroma_vectorstore,
)
from answer_service.infrastructure.persistence.models.base import metadata
from answer_service.setup.bootstrap import (
    setup_http_exc_handlers,
    setup_http_routes,
    setup_map_tables,
)
from answer_service.setup.configs.asgi_config import ASGIConfig
from answer_service.setup.configs.chroma_config import ChromaConfig
from answer_service.setup.configs.database_config import PostgresConfig, SQLAlchemyConfig
from answer_service.setup.configs.llm_config import OpenAIConfig
from answer_service.setup.ioc import (
    bazario_provider,
    configs_provider,
    db_provider,
    domain_ports_provider,
    gateways_provider,
    interactors_provider,
    mappers_provider,
)

# Force all integration tests to share the session-scoped event loop so that
# session-scoped async fixtures (PostgreSQL engine, Dishka container) and the
# test functions themselves run in the same loop.
pytestmark = pytest.mark.asyncio(loop_scope="session")

_POSTGRES_IMAGE: Final[str] = "postgres:16-alpine"
_TRUNCATE_SQL: Final[str] = (
    "TRUNCATE TABLE messages, conversations, document_chunks, lesson_indexes, users, outbox_messages CASCADE"
)
_FAKE_LLM_RESPONSE: Final[str] = "Integration test answer."


def test_vector_store_provider() -> Provider:
    """Replaces vector_store_provider() with fast, in-process test doubles.

    FakeEmbeddings, EphemeralClient and FakeChatModel are injected into the
    *unchanged* real adapters (LangChainEmbeddingPort, ChromaVectorSearchPort,
    LangChainOpenAILLMPort), so the full adapter code is exercised.
    create_chroma_vectorstore is reused directly from chroma_provider.py.
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


def _reset_chroma(chroma: Chroma) -> None:
    """Delete all vectors from the Chroma collection (sync, called via to_thread)."""
    collection = chroma._collection  # private attr — acceptable in test code
    ids: list[str] = collection.get()["ids"]
    if ids:
        collection.delete(ids=ids)


@pytest.fixture(scope="session", autouse=True)
def _setup_map_tables() -> None:
    """Initialize SQLAlchemy imperative mappings once per test session."""
    with contextlib.suppress(Exception):
        setup_map_tables()


@pytest.fixture(scope="session")
def postgres_container() -> Generator[PostgresContainer, None, None]:
    with PostgresContainer(_POSTGRES_IMAGE) as container:
        yield container


@pytest.fixture(scope="session")
async def dishka_container(
    postgres_container: PostgresContainer,
    _setup_map_tables: None,
) -> AsyncGenerator[AsyncContainer, None]:
    host: str = postgres_container.get_container_host_ip()
    port: int = int(postgres_container.get_exposed_port(5432))

    # Keep env in sync so PostgresConfig.override_host_from_env validator works.
    os.environ["POSTGRES_HOST"] = host
    os.environ["POSTGRES_PORT"] = str(port)

    postgres_cfg = PostgresConfig(
        POSTGRES_USER=postgres_container.username,
        POSTGRES_PASSWORD=postgres_container.password,
        POSTGRES_HOST=host,
        POSTGRES_PORT=port,
        POSTGRES_DB=postgres_container.dbname,
        POSTGRES_DRIVER="asyncpg",
    )
    alchemy_cfg = SQLAlchemyConfig(
        DB_POOL_PRE_PING=True,
        DB_POOL_RECYCLE=300,
        DB_POOL_SIZE=2,
        DB_POOL_MAX_OVERFLOW=0,
        DB_ECHO=False,
    )
    context = {
        ASGIConfig: ASGIConfig(),
        PostgresConfig: postgres_cfg,
        SQLAlchemyConfig: alchemy_cfg,
        ChromaConfig: ChromaConfig(),
        OpenAIConfig: OpenAIConfig(OPENAI_API_KEY="sk-fake-for-tests"),
    }

    container: AsyncContainer = make_async_container(
        configs_provider(),
        db_provider(),
        test_vector_store_provider(),  # replaces vector_store_provider()
        bazario_provider(),
        mappers_provider(),
        domain_ports_provider(),
        gateways_provider(),
        interactors_provider(),
        context=context,
    )

    engine: AsyncEngine = await container.get(AsyncEngine)
    async with engine.begin() as conn:
        await conn.run_sync(metadata.create_all)

    yield container

    await container.close()


@pytest.fixture(scope="session")
def app(dishka_container: AsyncContainer) -> FastAPI:
    fastapi_app = FastAPI(title="answer-service [test]")
    setup_http_routes(fastapi_app)
    setup_http_exc_handlers(fastapi_app)
    setup_dishka(dishka_container, app=fastapi_app)
    return fastapi_app


@pytest.fixture()
async def client(app: FastAPI) -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


@pytest.fixture(autouse=True)
async def clean_db(dishka_container: AsyncContainer) -> AsyncGenerator[None, None]:
    """Truncate all PostgreSQL tables and clear Chroma collection after every test."""
    yield
    engine: AsyncEngine = await dishka_container.get(AsyncEngine)
    async with engine.begin() as conn:
        await conn.execute(text(_TRUNCATE_SQL))
    chroma: Chroma = await dishka_container.get(Chroma)
    await asyncio.to_thread(_reset_chroma, chroma)
