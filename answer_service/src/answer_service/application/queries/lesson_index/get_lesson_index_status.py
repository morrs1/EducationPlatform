import structlog
from dataclasses import dataclass
from typing import Final, final
from uuid import UUID

from answer_service.application.common.ports.lesson_index_repository import LessonIndexRepository
from answer_service.application.common.views.lesson_index_views import LessonIndexStatusView

logger: Final[structlog.BoundLogger] = structlog.get_logger()


class LessonIndexNotFoundError(Exception):
    pass


@dataclass(frozen=True, slots=True, kw_only=True)
class GetLessonIndexStatusQuery:
    lesson_id: UUID


@final
class GetLessonIndexStatusQueryHandler:
    def __init__(self, lesson_index_repository: LessonIndexRepository) -> None:
        self._lesson_index_repository: Final[LessonIndexRepository] = lesson_index_repository

    async def __call__(self, data: GetLessonIndexStatusQuery) -> LessonIndexStatusView:
        logger.info("get_lesson_index_status: started", lesson_id=str(data.lesson_id))

        lesson_index = await self._lesson_index_repository.get_by_lesson_id(data.lesson_id)
        if lesson_index is None:
            msg = f"LessonIndex for lesson '{data.lesson_id}' not found."
            raise LessonIndexNotFoundError(msg)

        return LessonIndexStatusView(
            lesson_id=lesson_index.id,
            title=lesson_index.title,
            status=str(lesson_index.status),
            chunks_count=len(lesson_index.chunks),
            indexed_at=lesson_index.updated_at if lesson_index.chunks else None,
        )
