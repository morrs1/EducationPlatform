"""Unit tests for RelayOutboxCommandHandler."""

import json
from datetime import UTC, datetime
from typing import cast
from unittest.mock import AsyncMock, call
from uuid import uuid4

import pytest

from answer_service.application.commands.outbox.relay_outbox import (
    RelayOutboxCommand,
    RelayOutboxCommandHandler,
)
from answer_service.application.common.outbox_message import OutboxMessage
from answer_service.application.common.ports.outbox_publisher import OutboxPublisher
from answer_service.application.common.ports.outbox_repository import OutboxRepository
from answer_service.application.common.ports.transaction_manager import TransactionManager
from answer_service.domain.common.errors import AppError


def _make_message(*, event_type: str = "SomeEvent") -> OutboxMessage:
    return OutboxMessage(
        id=uuid4(),
        event_type=event_type,
        payload=json.dumps({"key": "value"}),
        created_at=datetime.now(UTC),
    )


@pytest.fixture()
def outbox_repository() -> OutboxRepository:
    return cast("OutboxRepository", AsyncMock())


@pytest.fixture()
def outbox_publisher() -> OutboxPublisher:
    return cast("OutboxPublisher", AsyncMock())


@pytest.fixture()
def transaction_manager() -> TransactionManager:
    return cast("TransactionManager", AsyncMock())


@pytest.fixture()
def handler(
    outbox_repository: OutboxRepository,
    outbox_publisher: OutboxPublisher,
    transaction_manager: TransactionManager,
) -> RelayOutboxCommandHandler:
    return RelayOutboxCommandHandler(
        outbox_repository=outbox_repository,
        outbox_publisher=outbox_publisher,
        transaction_manager=transaction_manager,
    )


async def test_relay_outbox_publishes_all_pending_messages(
    handler: RelayOutboxCommandHandler,
    outbox_repository: OutboxRepository,
    outbox_publisher: OutboxPublisher,
    transaction_manager: TransactionManager,
) -> None:
    # Arrange
    messages = [_make_message(), _make_message(), _make_message()]
    outbox_repository.get_pending = AsyncMock(return_value=messages)

    # Act
    await handler(RelayOutboxCommand())

    # Assert
    assert outbox_publisher.publish.call_count == 3
    assert outbox_repository.mark_processed.call_count == 3
    transaction_manager.commit.assert_awaited_once()


async def test_relay_outbox_marks_processed_in_order(
    handler: RelayOutboxCommandHandler,
    outbox_repository: OutboxRepository,
) -> None:
    # Arrange
    messages = [_make_message(), _make_message()]
    outbox_repository.get_pending = AsyncMock(return_value=messages)

    # Act
    await handler(RelayOutboxCommand())

    # Assert
    expected_calls = [call(messages[0].id), call(messages[1].id)]
    outbox_repository.mark_processed.assert_has_calls(expected_calls)


async def test_relay_outbox_skips_failed_message_and_continues(
    handler: RelayOutboxCommandHandler,
    outbox_repository: OutboxRepository,
    outbox_publisher: OutboxPublisher,
    transaction_manager: TransactionManager,
) -> None:
    # Arrange
    good = _make_message(event_type="GoodEvent")
    bad = _make_message(event_type="BadEvent")
    outbox_repository.get_pending = AsyncMock(return_value=[bad, good])
    outbox_publisher.publish = AsyncMock(side_effect=[AppError("broker down"), None])

    # Act
    await handler(RelayOutboxCommand())

    # Assert — only the good message is marked and committed
    outbox_repository.mark_processed.assert_awaited_once_with(good.id)
    transaction_manager.commit.assert_awaited_once()


async def test_relay_outbox_does_not_commit_when_nothing_published(
    handler: RelayOutboxCommandHandler,
    outbox_repository: OutboxRepository,
    outbox_publisher: OutboxPublisher,
    transaction_manager: TransactionManager,
) -> None:
    # Arrange
    outbox_repository.get_pending = AsyncMock(return_value=[])

    # Act
    await handler(RelayOutboxCommand())

    # Assert
    outbox_publisher.publish.assert_not_awaited()
    transaction_manager.commit.assert_not_awaited()


async def test_relay_outbox_does_not_commit_when_all_messages_fail(
    handler: RelayOutboxCommandHandler,
    outbox_repository: OutboxRepository,
    outbox_publisher: OutboxPublisher,
    transaction_manager: TransactionManager,
) -> None:
    # Arrange
    messages = [_make_message(), _make_message()]
    outbox_repository.get_pending = AsyncMock(return_value=messages)
    outbox_publisher.publish = AsyncMock(side_effect=AppError("down"))

    # Act
    await handler(RelayOutboxCommand())

    # Assert
    outbox_repository.mark_processed.assert_not_awaited()
    transaction_manager.commit.assert_not_awaited()


async def test_relay_outbox_uses_custom_batch_size(
    handler: RelayOutboxCommandHandler,
    outbox_repository: OutboxRepository,
) -> None:
    # Arrange
    outbox_repository.get_pending = AsyncMock(return_value=[])

    # Act
    await handler(RelayOutboxCommand(batch_size=42))

    # Assert
    outbox_repository.get_pending.assert_awaited_once_with(limit=42)
