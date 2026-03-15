from typing import cast
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from answer_service.application.commands.lesson_index.schedule_reindex_lesson import (
    ScheduleReindexLessonCommand,
    ScheduleReindexLessonCommandHandler,
    ScheduleReindexLessonView,
)
from answer_service.application.common.ports.scheduler.payloads import (
    ReindexLessonPayload,
)
from answer_service.application.common.ports.scheduler.task_id import TaskID, TaskKey
from answer_service.application.common.ports.scheduler.task_scheduler import TaskScheduler


@pytest.fixture()
def task_scheduler() -> TaskScheduler:
    scheduler = MagicMock(spec=TaskScheduler)
    scheduler.schedule = AsyncMock()
    return cast("TaskScheduler", scheduler)


@pytest.fixture()
def handler(task_scheduler: TaskScheduler) -> ScheduleReindexLessonCommandHandler:
    return ScheduleReindexLessonCommandHandler(task_scheduler=task_scheduler)


async def test_schedule_reindex_lesson_returns_view_with_task_id(
    handler: ScheduleReindexLessonCommandHandler,
    task_scheduler: TaskScheduler,
) -> None:
    # Arrange
    lesson_id = uuid4()
    expected_task_id = TaskID(f"reindex_lesson:{lesson_id}")
    task_scheduler.make_task_id.return_value = expected_task_id
    command = ScheduleReindexLessonCommand(
        lesson_id=lesson_id, new_content="Updated content"
    )

    # Act
    result = await handler(command)

    # Assert
    assert isinstance(result, ScheduleReindexLessonView)
    assert result.task_id == expected_task_id


async def test_schedule_reindex_lesson_uses_reindex_lesson_task_key(
    handler: ScheduleReindexLessonCommandHandler,
    task_scheduler: TaskScheduler,
) -> None:
    # Arrange
    lesson_id = uuid4()
    task_scheduler.make_task_id.return_value = TaskID("reindex_lesson:test")
    command = ScheduleReindexLessonCommand(lesson_id=lesson_id, new_content="Content")

    # Act
    await handler(command)

    # Assert — key must match the registered taskiq task name
    task_scheduler.make_task_id.assert_called_once_with(
        TaskKey("reindex_lesson"), lesson_id
    )


async def test_schedule_reindex_lesson_passes_correct_payload_with_title(
    handler: ScheduleReindexLessonCommandHandler,
    task_scheduler: TaskScheduler,
) -> None:
    # Arrange
    lesson_id = uuid4()
    task_id = TaskID(f"reindex_lesson:{lesson_id}")
    task_scheduler.make_task_id.return_value = task_id
    command = ScheduleReindexLessonCommand(
        lesson_id=lesson_id, new_content="New content", new_title="New Title"
    )

    # Act
    await handler(command)

    # Assert
    task_scheduler.schedule.assert_awaited_once_with(
        task_id,
        ReindexLessonPayload(
            lesson_id=lesson_id, new_content="New content", new_title="New Title"
        ),
    )


async def test_schedule_reindex_lesson_passes_none_title_when_omitted(
    handler: ScheduleReindexLessonCommandHandler,
    task_scheduler: TaskScheduler,
) -> None:
    # Arrange
    lesson_id = uuid4()
    task_id = TaskID(f"reindex_lesson:{lesson_id}")
    task_scheduler.make_task_id.return_value = task_id
    command = ScheduleReindexLessonCommand(lesson_id=lesson_id, new_content="Content")

    # Act
    await handler(command)

    # Assert — new_title must be None when not provided
    task_scheduler.schedule.assert_awaited_once_with(
        task_id,
        ReindexLessonPayload(lesson_id=lesson_id, new_content="Content", new_title=None),
    )
