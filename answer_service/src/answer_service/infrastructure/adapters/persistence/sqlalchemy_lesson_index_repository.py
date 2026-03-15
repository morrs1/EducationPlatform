import logging
from typing import Final, override
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from answer_service.application.common.ports.lesson_index_repository import (
    LessonIndexRepository,
)
from answer_service.domain.common.events_collection import EventsCollection
from answer_service.domain.lesson_index.entities.lesson_index import LessonIndex
from answer_service.infrastructure.errors import RepoError
from answer_service.infrastructure.persistence.models.lesson_index import (
    lesson_indexes_table,
)

logger: Final[logging.Logger] = logging.getLogger(__name__)


class SqlAlchemyLessonIndexRepository(LessonIndexRepository):
    """Persists LessonIndex metadata and DocumentChunk text/position in PostgreSQL only.

    Embedding vectors are NOT handled here — they are stored in ChromaDB
    and managed via VectorSearchPort directly in the application layer.
    """

    def __init__(
        self,
        session: AsyncSession,
        events_collection: EventsCollection,
    ) -> None:
        self._session: Final[AsyncSession] = session
        self._events_collection: Final[EventsCollection] = events_collection

    @override
    async def save(self, lesson_index: LessonIndex) -> None:
        self._session.add(lesson_index)

    @override
    async def get_by_lesson_id(self, lesson_id: UUID) -> LessonIndex | None:
        stmt = select(LessonIndex).where(lesson_indexes_table.c.id == lesson_id)
        try:
            result = (await self._session.execute(stmt)).scalar_one_or_none()
        except SQLAlchemyError as e:
            msg = "Database query failed."
            raise RepoError(msg) from e
        return self._inject(result) if result is not None else None

    def _inject(self, lesson_index: LessonIndex) -> LessonIndex:
        lesson_index.events_collection = self._events_collection
        return lesson_index
