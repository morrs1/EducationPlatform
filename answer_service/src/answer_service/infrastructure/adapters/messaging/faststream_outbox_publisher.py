from typing import Final, final, override

from faststream.rabbit import ExchangeType, RabbitBroker, RabbitExchange

from answer_service.application.common.outbox_message import OutboxMessage
from answer_service.application.common.ports.outbox_publisher import OutboxPublisher
from answer_service.infrastructure.errors import OutboxPublishError

_EVENTS_EXCHANGE: Final[str] = "domain_events"


@final
class FastStreamOutboxPublisher(OutboxPublisher):
    """Publishes outbox messages to RabbitMQ via FastStream."""

    def __init__(self, broker: RabbitBroker) -> None:
        self._broker: Final[RabbitBroker] = broker
        self._exchange: Final[RabbitExchange] = RabbitExchange(
            _EVENTS_EXCHANGE,
            type=ExchangeType.TOPIC,
        )

    @override
    async def publish(self, message: OutboxMessage) -> None:
        try:
            await self._broker.publish(
                message=message.payload,
                routing_key=message.event_type,
                exchange=self._exchange,
            )
        except Exception as exc:
            raise OutboxPublishError(str(exc)) from exc

