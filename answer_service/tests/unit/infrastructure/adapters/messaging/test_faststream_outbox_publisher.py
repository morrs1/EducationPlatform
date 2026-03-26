"""Unit tests for FastStreamOutboxPublisher."""

import json
from datetime import UTC, datetime
from typing import cast
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from faststream.rabbit import RabbitBroker

from answer_service.application.common.outbox_message import OutboxMessage
from answer_service.infrastructure.adapters.messaging.faststream_outbox_publisher import (
    FastStreamOutboxPublisher,
)
from answer_service.infrastructure.errors import OutboxPublishError

pytestmark = pytest.mark.asyncio(loop_scope="session")


def _make_message(
    payload: str = '{"x": 1}', event_type: str = "TestEvent"
) -> OutboxMessage:
    return OutboxMessage(
        id=uuid4(),
        event_type=event_type,
        payload=payload,
        created_at=datetime.now(UTC),
    )


@pytest.fixture()
def broker() -> RabbitBroker:
    return cast("RabbitBroker", AsyncMock(spec=RabbitBroker))


@pytest.fixture()
def publisher(broker: RabbitBroker) -> FastStreamOutboxPublisher:
    return FastStreamOutboxPublisher(broker=broker)


async def test_publish_passes_parsed_dict_to_broker(
    broker: RabbitBroker,
    publisher: FastStreamOutboxPublisher,
) -> None:
    # Arrange
    message = _make_message(payload='{"user_id": "abc"}')

    # Act
    await publisher.publish(message)

    # Assert — broker receives parsed dict, not raw JSON string
    broker.publish.assert_awaited_once()
    _, kwargs = broker.publish.call_args
    assert kwargs["message"] == json.loads(message.payload)


async def test_publish_sets_message_id_from_outbox_id(
    broker: RabbitBroker,
    publisher: FastStreamOutboxPublisher,
) -> None:
    # Arrange
    message = _make_message()

    # Act
    await publisher.publish(message)

    # Assert — message_id matches the stable outbox record UUID
    _, kwargs = broker.publish.call_args
    assert kwargs["message_id"] == str(message.id)


async def test_publish_uses_event_type_as_routing_key(
    broker: RabbitBroker,
    publisher: FastStreamOutboxPublisher,
) -> None:
    # Arrange
    message = _make_message(event_type="UserRegistered")

    # Act
    await publisher.publish(message)

    # Assert
    _, kwargs = broker.publish.call_args
    assert kwargs["routing_key"] == "UserRegistered"


async def test_publish_wraps_broker_exception_in_outbox_publish_error(
    broker: RabbitBroker,
    publisher: FastStreamOutboxPublisher,
) -> None:
    # Arrange
    broker.publish = AsyncMock(side_effect=RuntimeError("connection lost"))
    message = _make_message()

    # Act / Assert
    with pytest.raises(OutboxPublishError):
        await publisher.publish(message)
