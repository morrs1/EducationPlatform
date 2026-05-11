from typing import Annotated
from uuid import UUID

from pydantic import AliasChoices, BaseModel, ConfigDict, Field, StringConstraints

NonEmptyStr = Annotated[
    str,
    StringConstraints(min_length=1, strip_whitespace=True),
]


class LessonCreatedMessage(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    lesson_id: Annotated[
        UUID,
        Field(
            description="Lesson identifier.",
            validation_alias=AliasChoices("lesson_id", "lessonId", "lessonID"),
        ),
    ]
    title: Annotated[
        NonEmptyStr,
        Field(description="Lesson title."),
    ]
    content: Annotated[
        NonEmptyStr,
        Field(description="Full lesson content to be indexed."),
    ]


class LessonUpdatedMessage(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    lesson_id: Annotated[
        UUID,
        Field(
            description="Lesson identifier.",
            validation_alias=AliasChoices("lesson_id", "lessonId", "lessonID"),
        ),
    ]
    new_title: Annotated[
        NonEmptyStr | None,
        Field(
            default=None,
            description="Updated lesson title.",
            validation_alias=AliasChoices("new_title", "newTitle", "title"),
        ),
    ]
    new_content: Annotated[
        NonEmptyStr,
        Field(
            description="Updated lesson content to be re-indexed.",
            validation_alias=AliasChoices("new_content", "newContent", "content"),
        ),
    ]
