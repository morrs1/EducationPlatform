from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from answer_service.application.common.ports.lesson_index_repository import (
    LessonIndexRepository,
)
from answer_service.application.common.views.lesson_index_views import (
    LessonIndexStatusView,
)
from answer_service.application.errors import LessonIndexNotFoundError
from answer_service.application.queries.lesson_index.get_lesson_index_status import (
    GetLessonIndexStatusQuery,
    GetLessonIndexStatusQueryHandler,
)
from tests.unit.factories.entities import make_lesson_index


@pytest.fixture()
def handler(
    lesson_index_repository: LessonIndexRepository,
) -> GetLessonIndexStatusQueryHandler:
    return GetLessonIndexStatusQueryHandler(
        lesson_index_repository=lesson_index_repository,
    )


async def test_get_lesson_index_status_returns_view(
    handler: GetLessonIndexStatusQueryHandler,
    lesson_index_repository: LessonIndexRepository,
) -> None:
    # Arrange
    lesson_index = make_lesson_index()
    lesson_index_repository.get_by_lesson_id = AsyncMock(return_value=lesson_index)
    query = GetLessonIndexStatusQuery(lesson_id=uuid4())

    # Act
    result = await handler(query)

    # Assert
    assert isinstance(result, LessonIndexStatusView)
    assert result.lesson_id == lesson_index.id


async def test_get_lesson_index_status_raises_when_not_found(
    handler: GetLessonIndexStatusQueryHandler,
    lesson_index_repository: LessonIndexRepository,
) -> None:
    # Arrange
    lesson_index_repository.get_by_lesson_id = AsyncMock(return_value=None)
    query = GetLessonIndexStatusQuery(lesson_id=uuid4())

    # Act & Assert
    with pytest.raises(LessonIndexNotFoundError):
        await handler(query)
