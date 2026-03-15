from abc import abstractmethod
from typing import Protocol

from answer_service.application.common.inbox_message import InboxMessage


class InboxRepository(Protocol):
    @abstractmethod
    async def exists(self, message_id: str) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def save(self, message: InboxMessage) -> None:
        raise NotImplementedError
