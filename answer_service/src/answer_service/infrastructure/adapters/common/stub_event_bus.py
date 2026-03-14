import logging
from collections.abc import Iterable
from typing import Final, override

from answer_service.application.common.ports.event_bus import EventBus
from answer_service.domain.common.events import Event

logger: Final[logging.Logger] = logging.getLogger(__name__)


class StubEventBus(EventBus):
    """Logs domain events instead of publishing to a message broker.

    Replace with a FastStream/RabbitMQ adapter when the broker is wired up.
    """

    @override
    async def publish(self, events: Iterable[Event]) -> None:
        for event in events:
            logger.debug("Event published (stub): %s", event)
