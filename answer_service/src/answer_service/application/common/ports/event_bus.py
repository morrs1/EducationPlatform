from abc import abstractmethod
from collections.abc import Iterable
from typing import Protocol

from answer_service.domain.common.events import Event


class EventBus(Protocol):
    @abstractmethod
    async def publish(self, events: Iterable[Event]) -> None:
        raise NotImplementedError
