import logging
from dataclasses import dataclass
from typing import Final, final
from uuid import UUID

from answer_service.application.common.ports.scheduler.payloads import IndexLessonPayload
from answer_service.application.common.ports.scheduler.task_id import TaskID, TaskKey
from answer_service.application.common.ports.scheduler.task_scheduler import TaskScheduler

logger: Final[logging.Logger] = logging.getLogger(__name__)


@dataclass(frozen=True, slots=True, kw_only=True)
class ScheduleIndexLessonCommand:
    lesson_id: UUID
    title: str
    content: str


@dataclass(frozen=True, slots=True, kw_only=True)
class ScheduleIndexLessonView:
    task_id: TaskID


@final
class ScheduleIndexLessonCommandHandler:
    def __init__(self, task_scheduler: TaskScheduler) -> None:
        self._task_scheduler: Final[TaskScheduler] = task_scheduler

    async def __call__(self, data: ScheduleIndexLessonCommand) -> ScheduleIndexLessonView:
        logger.info("schedule_index_lesson: started. lesson_id='%s'.", data.lesson_id)
        task_id: TaskID = self._task_scheduler.make_task_id(
            TaskKey("index_lesson"), data.lesson_id
        )
        await self._task_scheduler.schedule(
            task_id,
            IndexLessonPayload(
                lesson_id=data.lesson_id,
                title=data.title,
                content=data.content,
            ),
        )
        logger.info("schedule_index_lesson: done. task_id='%s'.", task_id)
        return ScheduleIndexLessonView(task_id=task_id)
