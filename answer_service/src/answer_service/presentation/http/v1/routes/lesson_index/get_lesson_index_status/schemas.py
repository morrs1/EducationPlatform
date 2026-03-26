from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class LessonIndexStatusResponse(BaseModel):
    lesson_id: UUID
    title: str
    status: str
    chunks_count: int
    indexed_at: datetime | None
