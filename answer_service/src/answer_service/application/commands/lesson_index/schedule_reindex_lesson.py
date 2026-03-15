import logging
from dataclasses import dataclass
from typing import Final, final
from uuid import UUID

from answer_service.application.common.ports.scheduler.payloads import (
    ReindexLessonPayload,
)
from answer_service.application.common.ports.scheduler.task_id import TaskID, TaskKey
from answer_service.application.common.ports.scheduler.task_scheduler import TaskScheduler

logger: Final[logging.Logger] = logging.getLogger(__name__)


@dataclass(frozen=True, slots=True, kw_only=True)
class ScheduleReindexLessonCommand:
    lesson_id: UUID
    new_content: str
    new_title: str | None = None


@dataclass(frozen=True, slots=True, kw_only=True)
class ScheduleReindexLessonView:
    task_id: TaskID


@final
class ScheduleReindexLessonCommandHandler:
    def __init__(self, task_scheduler: TaskScheduler) -> None:
        self._task_scheduler: Final[TaskScheduler] = task_scheduler

    async def __call__(
        self, data: ScheduleReindexLessonCommand
    ) -> ScheduleReindexLessonView:
        logger.info("schedule_reindex_lesson: started. lesson_id='%s'.", data.lesson_id)
        task_id: TaskID = self._task_scheduler.make_task_id(
            TaskKey("reindex_lesson"), data.lesson_id
        )
        await self._task_scheduler.schedule(
            task_id,
            ReindexLessonPayload(
                lesson_id=data.lesson_id,
                new_content=data.new_content,
                new_title=data.new_title,
            ),
        )
        logger.info("schedule_reindex_lesson: done. task_id='%s'.", task_id)
        return ScheduleReindexLessonView(task_id=task_id)
