from abc import abstractmethod
from typing import Protocol

from answer_service.application.common.outbox_message import OutboxMessage
from answer_service.domain.common.events import Event


class EventSerializer(Protocol):
    """Port for converting domain events into serialised OutboxMessage DTOs."""

    @abstractmethod
    def serialize(self, event: Event) -> OutboxMessage:
        raise NotImplementedError
