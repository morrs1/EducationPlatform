from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass(frozen=True, slots=True, kw_only=True)
class LessonIndexStatusView:
    lesson_id: UUID
    title: str
    status: str
    chunks_count: int
    indexed_at: datetime | None
