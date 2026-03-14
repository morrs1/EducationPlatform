import logging
from typing import Final, override
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from answer_service.application.common.ports.user_repository import UserRepository
from answer_service.domain.common.events_collection import EventsCollection
from answer_service.domain.user.entities.user import User
from answer_service.infrastructure.errors import RepoError
from answer_service.infrastructure.persistence.models.user import users_table

logger: Final[logging.Logger] = logging.getLogger(__name__)


class SqlAlchemyUserRepository(UserRepository):
    def __init__(
        self,
        session: AsyncSession,
        events_collection: EventsCollection,
    ) -> None:
        self._session: Final[AsyncSession] = session
        self._events_collection: Final[EventsCollection] = events_collection

    @override
    async def save(self, user: User) -> None:
        self._session.add(user)

    @override
    async def get_by_id(self, user_id: UUID) -> User | None:
        stmt = select(User).where(users_table.c.id == user_id)
        try:
            result = (await self._session.execute(stmt)).scalar_one_or_none()
        except SQLAlchemyError as e:
            raise RepoError("Database query failed.") from e
        return self._inject(result) if result is not None else None

    def _inject(self, user: User) -> User:
        user.events_collection = self._events_collection
        return user
