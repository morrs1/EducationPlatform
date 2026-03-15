"""Integration tests for RelayOutboxCommandHandler and relay_outbox_task."""

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock

import pytest
from dishka import AsyncContainer
from faststream.rabbit import RabbitBroker
from taskiq import AsyncBroker

from answer_service.application.commands.outbox.relay_outbox import (
    RelayOutboxCommand,
    RelayOutboxCommandHandler,
)
from answer_service.application.common.ports.outbox_publisher import OutboxPublisher
from answer_service.application.common.ports.outbox_repository import OutboxRepository
from answer_service.application.common.ports.transaction_manager import TransactionManager
from answer_service.domain.common.errors import AppError
from tests.integration.outbox.conftest import SubscriberHandler, make_outbox_message

pytestmark = pytest.mark.asyncio(loop_scope="session")


# ---------------------------------------------------------------------------
# RelayOutboxCommandHandler — end-to-end with real DB + TestRabbitBroker
# ---------------------------------------------------------------------------


async def test_handler_publishes_pending_and_marks_processed(
    capture_subscriber: SubscriberHandler,
    test_rabbit_broker: RabbitBroker,
    outbox_repository: OutboxRepository,
    outbox_publisher: OutboxPublisher,
    transaction_manager: TransactionManager,
) -> None:
    # Arrange — seed two pending messages
    msg1 = make_outbox_message(event_type="EventA", payload='"payload_a"')
    msg2 = make_outbox_message(event_type="EventB", payload='"payload_b"')
    await outbox_repository.add(msg1)
    await outbox_repository.add(msg2)
    await transaction_manager.flush()
    await transaction_manager.commit()

    handler = RelayOutboxCommandHandler(
        outbox_repository=outbox_repository,
        outbox_publisher=outbox_publisher,
        transaction_manager=transaction_manager,
    )

    # Act
    await handler(RelayOutboxCommand())

    # Assert — both messages published to broker
    assert capture_subscriber.mock.call_count == 2

    # Assert — both messages marked processed in DB (not returned by get_pending)
    pending = await outbox_repository.get_pending()
    assert all(m.id not in {msg1.id, msg2.id} for m in pending)


async def test_handler_continues_after_one_publish_failure(
    outbox_repository: OutboxRepository,
    transaction_manager: TransactionManager,
) -> None:
    """When one publish fails the handler skips that message and continues."""
    # Arrange — seed two messages with distinct timestamps to guarantee ordering
    now = datetime.now(UTC)
    msg_fail = make_outbox_message(event_type="WillFail", created_at=now)
    msg_ok = make_outbox_message(
        event_type="WillSucceed", created_at=now + timedelta(seconds=1)
    )
    await outbox_repository.add(msg_fail)
    await outbox_repository.add(msg_ok)
    await transaction_manager.flush()
    await transaction_manager.commit()

    # side_effect must be on .publish (the method the handler calls), not on
    # the mock itself — otherwise the mock is called directly and side_effect
    # is never triggered when accessed via attribute lookup
    failing_publisher: OutboxPublisher = AsyncMock(spec=OutboxPublisher)
    failing_publisher.publish = AsyncMock(side_effect=[AppError("broker down"), None])

    handler = RelayOutboxCommandHandler(
        outbox_repository=outbox_repository,
        outbox_publisher=failing_publisher,
        transaction_manager=transaction_manager,
    )

    # Act
    await handler(RelayOutboxCommand())

    # Assert — only the second message was marked processed
    pending = await outbox_repository.get_pending()
    pending_ids = {m.id for m in pending}
    assert msg_fail.id in pending_ids
    assert msg_ok.id not in pending_ids


# ---------------------------------------------------------------------------
# relay_outbox_task — task registration and execution via InMemoryBroker
# ---------------------------------------------------------------------------


async def test_relay_outbox_task_is_registered_on_broker(  # noqa: RUF029 — pytestmark forces async
    inmemory_taskiq_broker: AsyncBroker,
) -> None:
    # Act
    task = inmemory_taskiq_broker.find_task("relay_outbox")

    # Assert
    assert task is not None
    assert task.task_name == "relay_outbox"


async def test_relay_outbox_task_executes_via_inmemory_broker(
    capture_subscriber: SubscriberHandler,
    test_rabbit_broker: RabbitBroker,
    worker_dishka_container: AsyncContainer,
    outbox_repository: OutboxRepository,
    transaction_manager: TransactionManager,
    inmemory_taskiq_broker: AsyncBroker,
) -> None:
    """Full task: InMemoryBroker kicks relay_outbox_task → handler reads DB → publishes."""
    # Arrange — seed a pending outbox message
    await outbox_repository.add(
        make_outbox_message(event_type="UserRegistered", payload='"seed"')
    )
    await transaction_manager.commit()

    # Act — kick the registered task
    task = inmemory_taskiq_broker.find_task("relay_outbox")
    assert task is not None
    result = await task.kicker().kiq()
    await result.wait_result(timeout=5)

    # Assert — subscriber received the message
    capture_subscriber.mock.assert_called_once_with('"seed"')
