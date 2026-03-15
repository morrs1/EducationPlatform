from typing import cast
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from answer_service.application.commands.lesson_index.schedule_index_lesson import (
    ScheduleIndexLessonCommand,
    ScheduleIndexLessonCommandHandler,
    ScheduleIndexLessonView,
)
from answer_service.application.common.ports.scheduler.payloads import IndexLessonPayload
from answer_service.application.common.ports.scheduler.task_id import TaskID, TaskKey
from answer_service.application.common.ports.scheduler.task_scheduler import TaskScheduler


@pytest.fixture()
def task_scheduler() -> TaskScheduler:
    scheduler = MagicMock(spec=TaskScheduler)
    scheduler.schedule = AsyncMock()
    return cast("TaskScheduler", scheduler)


@pytest.fixture()
def handler(task_scheduler: TaskScheduler) -> ScheduleIndexLessonCommandHandler:
    return ScheduleIndexLessonCommandHandler(task_scheduler=task_scheduler)


async def test_schedule_index_lesson_returns_view_with_task_id(
    handler: ScheduleIndexLessonCommandHandler,
    task_scheduler: TaskScheduler,
) -> None:
    # Arrange
    lesson_id = uuid4()
    expected_task_id = TaskID(f"index_lesson:{lesson_id}")
    task_scheduler.make_task_id.return_value = expected_task_id
    command = ScheduleIndexLessonCommand(
        lesson_id=lesson_id, title="Lesson Title", content="Lesson content"
    )

    # Act
    result = await handler(command)

    # Assert
    assert isinstance(result, ScheduleIndexLessonView)
    assert result.task_id == expected_task_id


async def test_schedule_index_lesson_uses_index_lesson_task_key(
    handler: ScheduleIndexLessonCommandHandler,
    task_scheduler: TaskScheduler,
) -> None:
    # Arrange
    lesson_id = uuid4()
    task_scheduler.make_task_id.return_value = TaskID("index_lesson:test")
    command = ScheduleIndexLessonCommand(
        lesson_id=lesson_id, title="Title", content="Content"
    )

    # Act
    await handler(command)

    # Assert — key must match the registered taskiq task name
    task_scheduler.make_task_id.assert_called_once_with(
        TaskKey("index_lesson"), lesson_id
    )


async def test_schedule_index_lesson_passes_correct_payload(
    handler: ScheduleIndexLessonCommandHandler,
    task_scheduler: TaskScheduler,
) -> None:
    # Arrange
    lesson_id = uuid4()
    task_id = TaskID(f"index_lesson:{lesson_id}")
    task_scheduler.make_task_id.return_value = task_id
    command = ScheduleIndexLessonCommand(
        lesson_id=lesson_id, title="My Title", content="My content"
    )

    # Act
    await handler(command)

    # Assert
    task_scheduler.schedule.assert_awaited_once_with(
        task_id,
        IndexLessonPayload(lesson_id=lesson_id, title="My Title", content="My content"),
    )
