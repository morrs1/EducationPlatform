"""Integration tests for FastStreamOutboxPublisher using TestRabbitBroker."""

import pytest
from faststream.rabbit import ExchangeType, RabbitBroker, RabbitExchange, RabbitQueue

from answer_service.infrastructure.adapters.messaging.faststream_outbox_publisher import (
    FastStreamOutboxPublisher,
)
from answer_service.infrastructure.errors import OutboxPublishError
from tests.integration.outbox.conftest import SubscriberHandler, make_outbox_message

pytestmark = pytest.mark.asyncio(loop_scope="session")


async def test_publishes_payload_to_domain_events_exchange(
    capture_subscriber: SubscriberHandler,
    test_rabbit_broker: RabbitBroker,
    outbox_publisher: FastStreamOutboxPublisher,
) -> None:
    # Arrange
    message = make_outbox_message(
        event_type="UserRegistered", payload='{"user_id": "abc"}'
    )

    # Act
    await outbox_publisher.publish(message)

    # Assert — wildcard subscriber received exactly the payload string
    capture_subscriber.mock.assert_called_once_with(message.payload)


async def test_routes_by_event_type_as_routing_key(
    capture_subscriber: SubscriberHandler,
    rabbit_broker: RabbitBroker,
    test_rabbit_broker: RabbitBroker,
    outbox_publisher: FastStreamOutboxPublisher,
) -> None:
    """Only the subscriber with matching routing key receives the message."""
    received: list[str] = []

    @rabbit_broker.subscriber(
        queue=RabbitQueue("specific_q", routing_key="SpecificEvent"),
        exchange=RabbitExchange("domain_events", type=ExchangeType.TOPIC),
    )
    def specific_handler(body: str) -> None:
        received.append(body)

    # Arrange — publish an event with a different routing key
    message = make_outbox_message(event_type="OtherEvent")

    # Act
    await outbox_publisher.publish(message)

    # Assert — specific_handler was NOT called (routing key mismatch)
    specific_handler.mock.assert_not_called()


async def test_publishes_multiple_messages_independently(
    capture_subscriber: SubscriberHandler,
    test_rabbit_broker: RabbitBroker,
    outbox_publisher: FastStreamOutboxPublisher,
) -> None:
    # Arrange
    messages = [
        make_outbox_message(event_type="EventA", payload='"payload_a"'),
        make_outbox_message(event_type="EventB", payload='"payload_b"'),
        make_outbox_message(event_type="EventC", payload='"payload_c"'),
    ]

    # Act
    for msg in messages:
        await outbox_publisher.publish(msg)

    # Assert
    assert capture_subscriber.mock.call_count == 3


async def test_raises_outbox_publish_error_when_broker_is_not_connected(
    rabbit_broker: RabbitBroker,
) -> None:
    """Publish to a disconnected broker must raise OutboxPublishError."""
    # Arrange — bare broker, NOT wrapped in TestRabbitBroker
    publisher = FastStreamOutboxPublisher(broker=rabbit_broker)
    message = make_outbox_message()

    # Act & Assert
    with pytest.raises(OutboxPublishError):
        await publisher.publish(message)
