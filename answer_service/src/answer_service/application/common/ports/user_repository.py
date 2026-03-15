from abc import abstractmethod
from typing import Protocol
from uuid import UUID

from answer_service.application.common.query_params.user_params import UserListParams
from answer_service.domain.user.entities.user import User


class UserRepository(Protocol):
    @abstractmethod
    async def save(self, user: User) -> None:
        raise NotImplementedError

    @abstractmethod
    async def get_by_id(self, user_id: UUID) -> User | None:
        raise NotImplementedError

    @abstractmethod
    async def get_all(self, params: UserListParams) -> list[User]:
        raise NotImplementedError

    @abstractmethod
    async def delete(self, user_id: UUID) -> None:
        raise NotImplementedError
