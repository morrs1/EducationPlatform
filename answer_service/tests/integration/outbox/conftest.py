"""Shared fixtures for outbox integration tests."""

from collections.abc import AsyncGenerator
from datetime import UTC, datetime
from typing import Any, Final, Protocol
from unittest.mock import MagicMock
from uuid import uuid4

import pytest
from dishka import AsyncContainer, make_async_container
from dishka.integrations.taskiq import setup_dishka
from faststream.rabbit import ExchangeType, RabbitBroker, RabbitExchange, RabbitQueue
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker
from taskiq import AsyncBroker

from answer_service.application.common.outbox_message import OutboxMessage
from answer_service.application.common.ports.outbox_publisher import OutboxPublisher
from answer_service.application.common.ports.outbox_repository import OutboxRepository
from answer_service.application.common.ports.transaction_manager import TransactionManager
from answer_service.infrastructure.adapters.messaging.faststream_outbox_publisher import (
    FastStreamOutboxPublisher,
)
from answer_service.infrastructure.adapters.persistence.sqlalchemy_outbox_repository import (
    SqlAlchemyOutboxRepository,
)
from answer_service.infrastructure.adapters.persistence.sqlalchemy_transaction_manager import (
    SqlAlchemyTransactionManager,
)
from tests.integration.ioc import outbox_worker_test_providers

_DOMAIN_EVENTS_EXCHANGE: Final[str] = "domain_events"


class SubscriberHandler(Protocol):
    """Typing protocol for FastStream test subscriber handlers that expose a mock."""

    mock: MagicMock


@pytest.fixture()
async def _db_session(
    dishka_container: AsyncContainer,
) -> AsyncGenerator[AsyncSession, None]:
    """Internal AsyncSession shared within one test.

    Not exposed to test functions — tests interact only through
    ``outbox_repository`` and ``transaction_manager`` interfaces.
    """
    engine: AsyncEngine = await dishka_container.get(AsyncEngine)
    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with factory() as session:
        yield session


@pytest.fixture()
def outbox_repository(_db_session: AsyncSession) -> OutboxRepository:
    return SqlAlchemyOutboxRepository(session=_db_session)


@pytest.fixture()
def transaction_manager(_db_session: AsyncSession) -> TransactionManager:
    return SqlAlchemyTransactionManager(session=_db_session)


@pytest.fixture()
def outbox_publisher(rabbit_broker: RabbitBroker) -> OutboxPublisher:
    """Publisher bound to rabbit_broker (patched by test_rabbit_broker fixture)."""
    return FastStreamOutboxPublisher(broker=rabbit_broker)


@pytest.fixture()
async def worker_dishka_container(
    dishka_container: AsyncContainer,
    rabbit_broker: RabbitBroker,
    inmemory_taskiq_broker: AsyncBroker,
) -> AsyncGenerator[AsyncContainer, None]:
    """Minimal Dishka container wired to InMemoryBroker for outbox relay task tests.

    Provides the same dependencies as the real taskiq worker (engine, session,
    broker, outbox relay handler) but uses the test's in-process engine and
    TestRabbitBroker instead of real infrastructure.
    """
    engine: AsyncEngine = await dishka_container.get(AsyncEngine)
    factory = async_sessionmaker(engine, expire_on_commit=False)
    providers = outbox_worker_test_providers(engine, factory, rabbit_broker)
    container: AsyncContainer = make_async_container(*providers)
    setup_dishka(container, broker=inmemory_taskiq_broker)
    yield container
    await container.close()


@pytest.fixture()
def capture_subscriber(rabbit_broker: RabbitBroker) -> SubscriberHandler:
    """Register a wildcard subscriber on domain_events TOPIC exchange.

    Must be requested BEFORE test_rabbit_broker so FastStream registers
    the subscriber before broker startup (routing table is built at startup).

    Usage::

        async def test_something(
            capture_subscriber: SubscriberHandler,
            test_rabbit_broker: RabbitBroker,
            ...,
        ) -> None:
            ...
            capture_subscriber.mock.assert_called_once_with(expected_body)
    """

    @rabbit_broker.subscriber(
        queue=RabbitQueue("test_capture", routing_key="#"),
        exchange=RabbitExchange(_DOMAIN_EVENTS_EXCHANGE, type=ExchangeType.TOPIC),
    )
    async def _handler(body: dict[str, Any]) -> None: ...

    # FastStream attaches .mock to the handler at TestRabbitBroker startup
    return _handler


def make_outbox_message(
    *,
    event_type: str = "TestEvent",
    payload: str = '{"x": 1}',
    created_at: datetime | None = None,
) -> OutboxMessage:
    return OutboxMessage(
        id=uuid4(),
        event_type=event_type,
        payload=payload,
        created_at=created_at if created_at is not None else datetime.now(UTC),
    )
