import json
from typing import Any, Final, final, override

from faststream.rabbit import ExchangeType, RabbitBroker, RabbitExchange

from answer_service.application.common.outbox_message import OutboxMessage
from answer_service.application.common.ports.outbox_publisher import OutboxPublisher
from answer_service.infrastructure.errors import OutboxPublishError

_EVENTS_EXCHANGE: Final[str] = "domain_events"


@final
class FastStreamOutboxPublisher(OutboxPublisher):
    """Publishes outbox messages to RabbitMQ via FastStream.

    Two important invariants are enforced on every publish:

    ``message_id`` is set to ``str(message.id)`` — the outbox record UUID.
    This value is stable across retries (the outbox row never changes its PK),
    so consumers running InboxMiddleware can use it as an idempotency key.

    ``message.payload`` is a JSON string produced by RetortEventSerializer.
    It is parsed back to a dict before handing it to FastStream so that
    FastStream sets ``content_type: application/json`` and serialises the
    dict correctly.  Publishing a raw ``str`` would cause FastStream to set
    ``content_type: text/plain``, which breaks consumers that expect a
    structured JSON body.
    """

    def __init__(self, broker: RabbitBroker) -> None:
        self._broker: Final[RabbitBroker] = broker
        self._exchange: Final[RabbitExchange] = RabbitExchange(
            _EVENTS_EXCHANGE,
            type=ExchangeType.TOPIC,
        )

    @override
    async def publish(self, message: OutboxMessage) -> None:
        try:
            body: dict[str, Any] = json.loads(message.payload)
            await self._broker.publish(
                message=body,
                routing_key=message.event_type,
                exchange=self._exchange,
                message_id=str(message.id),
            )
        except Exception as exc:
            raise OutboxPublishError(str(exc)) from exc
