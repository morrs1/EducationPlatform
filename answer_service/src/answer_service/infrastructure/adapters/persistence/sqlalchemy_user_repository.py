import logging
from typing import Final, override
from uuid import UUID

from sqlalchemy import asc, delete, desc, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from answer_service.application.common.ports.user_repository import UserRepository
from answer_service.application.common.query_params.sorting import SortingOrder
from answer_service.application.common.query_params.user_params import UserListParams
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
        try:
            self._session.add(user)
        except SQLAlchemyError as e:
            raise RepoError("Database query failed.") from e

    @override
    async def get_by_id(self, user_id: UUID) -> User | None:
        stmt = select(User).where(users_table.c.id == user_id)
        try:
            result = (await self._session.execute(stmt)).scalar_one_or_none()
        except SQLAlchemyError as e:
            raise RepoError("Database query failed.") from e
        return self._inject(result) if result is not None else None

    @override
    async def get_all(self, params: UserListParams) -> list[User]:
        order_col = users_table.c[params.sorting_field.value]
        order_fn = asc if params.sorting_order == SortingOrder.ASC else desc
        stmt = (
            select(User)
            .order_by(order_fn(order_col))
            .limit(params.pagination.limit)
            .offset(params.pagination.offset)
        )
        try:
            results = (await self._session.execute(stmt)).scalars().all()
        except SQLAlchemyError as e:
            raise RepoError("Database query failed.") from e
        return [self._inject(u) for u in results]

    @override
    async def delete(self, user_id: UUID) -> None:
        stmt = delete(User).where(users_table.c.id == user_id)
        try:
            await self._session.execute(stmt)
        except SQLAlchemyError as e:
            raise RepoError("Database query failed.") from e

    def _inject(self, user: User) -> User:
        user.events_collection = self._events_collection
        return user
