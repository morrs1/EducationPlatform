"""Integration tests for SqlAlchemyOutboxRepository against a real PostgreSQL database."""

import pytest

from answer_service.application.common.ports.outbox_repository import OutboxRepository
from answer_service.application.common.ports.transaction_manager import TransactionManager
from tests.integration.outbox.conftest import make_outbox_message

pytestmark = pytest.mark.asyncio(loop_scope="session")


async def test_add_and_get_pending_returns_inserted_messages(
    outbox_repository: OutboxRepository,
    transaction_manager: TransactionManager,
) -> None:
    # Arrange
    msg1 = make_outbox_message(event_type="EventA")
    msg2 = make_outbox_message(event_type="EventB")
    await outbox_repository.add(msg1)
    await outbox_repository.add(msg2)
    await transaction_manager.flush()

    # Act
    pending = await outbox_repository.get_pending()

    # Assert
    pending_ids = {m.id for m in pending}
    assert msg1.id in pending_ids
    assert msg2.id in pending_ids


async def test_get_pending_excludes_processed_messages(
    outbox_repository: OutboxRepository,
    transaction_manager: TransactionManager,
) -> None:
    # Arrange
    pending_msg = make_outbox_message(event_type="PendingEvent")
    processed_msg = make_outbox_message(event_type="ProcessedEvent")
    await outbox_repository.add(pending_msg)
    await outbox_repository.add(processed_msg)
    await transaction_manager.flush()
    await outbox_repository.mark_processed(processed_msg.id)
    await transaction_manager.flush()

    # Act
    pending = await outbox_repository.get_pending()

    # Assert
    pending_ids = {m.id for m in pending}
    assert pending_msg.id in pending_ids
    assert processed_msg.id not in pending_ids


async def test_get_pending_respects_limit(
    outbox_repository: OutboxRepository,
    transaction_manager: TransactionManager,
) -> None:
    # Arrange — insert 5 messages
    for _ in range(5):
        await outbox_repository.add(make_outbox_message())
    await transaction_manager.flush()

    # Act
    pending = await outbox_repository.get_pending(limit=3)

    # Assert
    assert len(pending) == 3


async def test_mark_processed_sets_processed_at(
    outbox_repository: OutboxRepository,
    transaction_manager: TransactionManager,
) -> None:
    # Arrange
    msg = make_outbox_message()
    await outbox_repository.add(msg)
    await transaction_manager.flush()

    # Act
    await outbox_repository.mark_processed(msg.id)
    await transaction_manager.flush()

    # Assert — message no longer appears in pending
    pending = await outbox_repository.get_pending()
    assert all(m.id != msg.id for m in pending)


async def test_get_pending_returns_all_unprocessed_messages(
    outbox_repository: OutboxRepository,
    transaction_manager: TransactionManager,
) -> None:
    # Arrange — 4 messages, mark 2 processed
    msgs = [make_outbox_message(event_type=f"Event{i}") for i in range(4)]
    for msg in msgs:
        await outbox_repository.add(msg)
    await transaction_manager.flush()
    await outbox_repository.mark_processed(msgs[0].id)
    await outbox_repository.mark_processed(msgs[1].id)
    await transaction_manager.flush()

    # Act
    pending = await outbox_repository.get_pending()

    # Assert — only the 2 unprocessed messages remain
    pending_ids = {m.id for m in pending}
    assert msgs[0].id not in pending_ids
    assert msgs[1].id not in pending_ids
    assert msgs[2].id in pending_ids
    assert msgs[3].id in pending_ids
