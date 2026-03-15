from uuid import UUID

from pydantic import BaseModel


class LessonCreatedMessage(BaseModel):
    lesson_id: UUID
    title: str
    content: str


class LessonUpdatedMessage(BaseModel):
    lesson_id: UUID
    new_title: str | None = None
    new_content: str
