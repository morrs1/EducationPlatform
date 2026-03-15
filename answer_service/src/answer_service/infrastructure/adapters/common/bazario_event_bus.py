import asyncio
import logging
from asyncio import Task
from collections.abc import Iterable
from typing import Final, final, override

from bazario.asyncio import Publisher

from answer_service.application.common.ports.event_bus import EventBus
from answer_service.application.common.ports.outbox_repository import OutboxRepository
from answer_service.domain.common.events import Event
from answer_service.infrastructure.outbox.event_serializer import EventSerializer

logger: Final[logging.Logger] = logging.getLogger(__name__)


@final
class BazarioEventBus(EventBus):
    """EventBus backed by the Outbox pattern + Bazario in-process dispatch.

    For each domain event:
    1. Serializes the event and persists it to the ``outbox_messages`` table
       **within the current request transaction** (at-least-once delivery).
    2. Dispatches the event to any registered in-process Bazario handlers
       as a background ``asyncio.Task`` (best-effort, non-blocking).

    The ``OutboxRelay`` is responsible for reading pending outbox messages
    and publishing them to RabbitMQ asynchronously.
    """

    def __init__(
        self,
        publisher: Publisher,
        outbox_repository: OutboxRepository,
        event_serializer: EventSerializer,
    ) -> None:
        self._publisher: Final[Publisher] = publisher
        self._outbox_repository: Final[OutboxRepository] = outbox_repository
        self._event_serializer: Final[EventSerializer] = event_serializer

    @override
    async def publish(self, events: Iterable[Event]) -> None:
        background_tasks: set[Task[None]] = set()
        for event in events:
            message = self._event_serializer.serialize(event)
            await self._outbox_repository.add(message)

            task: Task[None] = asyncio.create_task(self._publisher.publish(event))
            background_tasks.add(task)
            task.add_done_callback(background_tasks.discard)

        logger.debug("BazarioEventBus: %d event(s) enqueued to outbox", len(background_tasks))
