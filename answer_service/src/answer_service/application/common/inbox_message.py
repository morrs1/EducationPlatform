from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True, slots=True)
class InboxMessage:
    """DTO representing a single inbox deduplication entry.

    ``message_id`` is the AMQP message identifier set by the publisher.
    Storing it prevents re-processing redelivered or duplicate messages.
    """

    message_id: str
    created_at: datetime
