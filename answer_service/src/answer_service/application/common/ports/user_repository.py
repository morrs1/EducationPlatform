from abc import abstractmethod
from typing import Protocol
from uuid import UUID

from answer_service.domain.user.entities.user import User


class UserRepository(Protocol):
    @abstractmethod
    async def save(self, user: User) -> None:
        raise NotImplementedError

    @abstractmethod
    async def get_by_id(self, user_id: UUID) -> User | None:
        raise NotImplementedError
