"""Shared fixtures for scheduler integration tests."""

from collections.abc import AsyncGenerator

import pytest
from dishka import AsyncContainer, make_async_container
from dishka.integrations.taskiq import setup_dishka
from langchain_chroma import Chroma
from langchain_core.embeddings import Embeddings
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker
from taskiq import AsyncBroker

from tests.integration.ioc import lesson_index_worker_test_providers


@pytest.fixture()
async def scheduler_worker_container(
    dishka_container: AsyncContainer,
    inmemory_taskiq_broker: AsyncBroker,
) -> AsyncGenerator[AsyncContainer, None]:
    """Dishka container wired to InMemoryBroker for lesson index task tests.

    Shares the same AsyncEngine and Chroma instance as ``dishka_container``
    so tasks read/write the same PostgreSQL and vector store as the test assertions.
    """
    engine: AsyncEngine = await dishka_container.get(AsyncEngine)
    chroma: Chroma = await dishka_container.get(Chroma)
    embeddings: Embeddings = await dishka_container.get(Embeddings)
    factory: async_sessionmaker[AsyncSession] = async_sessionmaker(
        engine, expire_on_commit=False
    )

    providers = lesson_index_worker_test_providers(engine, factory, chroma, embeddings)
    container: AsyncContainer = make_async_container(*providers)
    setup_dishka(container, broker=inmemory_taskiq_broker)
    yield container
    await container.close()
