"""Unit tests for RabbitMQ lesson_index Pydantic schemas.

Cover three concerns:
- alias resolution (snake_case / camelCase / pascalID variants),
- empty/whitespace string rejection on title-like fields,
- happy-path parsing returns a UUID instance.
"""

from uuid import UUID

import pytest
from pydantic import ValidationError

from answer_service.presentation.rabbitmq.v1.routes.lesson_index.schemas import (
    LessonCreatedMessage,
    LessonUpdatedMessage,
)

_LESSON_ID: UUID = UUID("11111111-1111-1111-1111-111111111111")


@pytest.mark.parametrize(
    "lesson_id_key",
    (
        "lesson_id",  # snake_case (canonical)
        "lessonId",   # camelCase
        "lessonID",   # pascalID
    ),
)
def test_lesson_created_accepts_lesson_id_alias_variants(lesson_id_key: str) -> None:
    # Arrange
    payload: dict[str, str] = {
        lesson_id_key: str(_LESSON_ID),
        "title": "Python Basics",
        "content": "Python is a high-level programming language.",
    }

    # Act
    message = LessonCreatedMessage.model_validate(payload)

    # Assert
    assert message.lesson_id == _LESSON_ID
    assert message.title == "Python Basics"
    assert message.content == "Python is a high-level programming language."


@pytest.mark.parametrize(
    "lesson_id_key",
    (
        "lesson_id",
        "lessonId",
        "lessonID",
    ),
)
@pytest.mark.parametrize(
    ("new_title_key", "new_content_key"),
    (
        ("new_title", "new_content"),  # snake_case
        ("newTitle", "newContent"),    # camelCase
    ),
)
def test_lesson_updated_accepts_alias_variants(
    lesson_id_key: str,
    new_title_key: str,
    new_content_key: str,
) -> None:
    # Arrange
    payload: dict[str, str] = {
        lesson_id_key: str(_LESSON_ID),
        new_title_key: "Updated Title",
        new_content_key: "Updated content.",
    }

    # Act
    message = LessonUpdatedMessage.model_validate(payload)

    # Assert
    assert message.lesson_id == _LESSON_ID
    assert message.new_title == "Updated Title"
    assert message.new_content == "Updated content."


def test_lesson_updated_new_title_is_optional() -> None:
    # Arrange
    payload: dict[str, str] = {
        "lessonId": str(_LESSON_ID),
        "newContent": "Revised content.",
    }

    # Act
    message = LessonUpdatedMessage.model_validate(payload)

    # Assert
    assert message.new_title is None
    assert message.new_content == "Revised content."


@pytest.mark.parametrize(
    "bad_value",
    (
        "",       # empty string
        "   ",    # whitespace-only (stripped to empty by strip_whitespace)
        "\t\n",   # tabs and newlines only
    ),
)
def test_lesson_created_rejects_empty_title(bad_value: str) -> None:
    # Arrange
    payload: dict[str, str] = {
        "lesson_id": str(_LESSON_ID),
        "title": bad_value,
        "content": "Some content.",
    }

    # Act / Assert
    with pytest.raises(ValidationError) as exc_info:
        LessonCreatedMessage.model_validate(payload)
    assert any("title" in err["loc"] for err in exc_info.value.errors())


@pytest.mark.parametrize(
    "bad_value",
    (
        "",
        "   ",
        "\t\n",
    ),
)
def test_lesson_created_rejects_empty_content(bad_value: str) -> None:
    # Arrange
    payload: dict[str, str] = {
        "lesson_id": str(_LESSON_ID),
        "title": "Some title",
        "content": bad_value,
    }

    # Act / Assert
    with pytest.raises(ValidationError) as exc_info:
        LessonCreatedMessage.model_validate(payload)
    assert any("content" in err["loc"] for err in exc_info.value.errors())


@pytest.mark.parametrize(
    "bad_value",
    (
        "",
        "   ",
    ),
)
def test_lesson_updated_rejects_empty_new_content(bad_value: str) -> None:
    # Arrange
    payload: dict[str, str] = {
        "lesson_id": str(_LESSON_ID),
        "new_content": bad_value,
    }

    # Act / Assert
    with pytest.raises(ValidationError) as exc_info:
        LessonUpdatedMessage.model_validate(payload)
    assert any(
        "new_content" in err["loc"] or "newContent" in err["loc"]
        for err in exc_info.value.errors()
    )


@pytest.mark.parametrize(
    "bad_value",
    (
        "",
        "   ",
    ),
)
def test_lesson_updated_rejects_empty_new_title_when_provided(bad_value: str) -> None:
    # Arrange
    payload: dict[str, str] = {
        "lesson_id": str(_LESSON_ID),
        "new_title": bad_value,
        "new_content": "Some content.",
    }

    # Act / Assert
    with pytest.raises(ValidationError) as exc_info:
        LessonUpdatedMessage.model_validate(payload)
    assert any(
        "new_title" in err["loc"] or "newTitle" in err["loc"]
        for err in exc_info.value.errors()
    )


def test_lesson_created_strips_whitespace_around_title_and_content() -> None:
    # Arrange
    payload: dict[str, str] = {
        "lesson_id": str(_LESSON_ID),
        "title": "  Python  ",
        "content": "  Hello world.  ",
    }

    # Act
    message = LessonCreatedMessage.model_validate(payload)

    # Assert
    assert message.title == "Python"
    assert message.content == "Hello world."


def test_lesson_created_rejects_invalid_lesson_id() -> None:
    # Arrange
    payload: dict[str, str] = {
        "lessonId": "not-a-uuid",
        "title": "T",
        "content": "C",
    }

    # Act / Assert
    with pytest.raises(ValidationError) as exc_info:
        LessonCreatedMessage.model_validate(payload)
    assert any(
        "lesson_id" in err["loc"]
        or "lessonId" in err["loc"]
        or "lessonID" in err["loc"]
        for err in exc_info.value.errors()
    )
