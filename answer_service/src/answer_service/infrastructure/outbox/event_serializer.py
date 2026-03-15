import json
import logging
from datetime import UTC, datetime
from typing import Final
from uuid import UUID, uuid4

from adaptix import Retort, dumper

from answer_service.application.common.outbox_message import OutboxMessage
from answer_service.domain.common.event_id import EventId
from answer_service.domain.common.events import Event

logger: Final[logging.Logger] = logging.getLogger(__name__)

_retort: Final[Retort] = Retort(
    recipe=[
        dumper(UUID, str),
        dumper(datetime, lambda dt: dt.isoformat()),
    ]
)


class EventSerializer:
    """Converts domain events to JSON-based OutboxMessage DTOs."""

    def serialize(self, event: Event) -> OutboxMessage:
        """Serialize *event* into an OutboxMessage ready to be persisted.

        Also stamps the event with ``event_id`` and ``event_date`` if not set.
        """
        event.set_event_id(EventId(uuid4()))
        event.set_event_date(datetime.now(UTC))

        payload: str = json.dumps(_retort.dump(event))

        return OutboxMessage(
            id=uuid4(),
            event_type=event.event_type,
            payload=payload,
            created_at=datetime.now(UTC),
        )
