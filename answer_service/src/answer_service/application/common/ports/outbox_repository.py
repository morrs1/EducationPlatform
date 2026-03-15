from abc import abstractmethod
from typing import Protocol
from uuid import UUID

from answer_service.application.common.outbox_message import OutboxMessage


class OutboxRepository(Protocol):
    @abstractmethod
    async def add(self, message: OutboxMessage) -> None:
        raise NotImplementedError

    @abstractmethod
    async def get_pending(self, limit: int = 100) -> list[OutboxMessage]:
        raise NotImplementedError

    @abstractmethod
    async def mark_processed(self, message_id: UUID) -> None:
        raise NotImplementedError
