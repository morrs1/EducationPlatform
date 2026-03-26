from dataclasses import dataclass

from answer_service.domain.common.events import Event
from answer_service.domain.lesson_index.value_objects.lesson_id import LessonId


@dataclass(frozen=True, kw_only=True)
class LessonIndexingRequested(Event):
    lesson_id: LessonId
    title: str


@dataclass(frozen=True, kw_only=True)
class LessonIndexed(Event):
    lesson_id: LessonId
    chunks_count: int


@dataclass(frozen=True, kw_only=True)
class LessonIndexingFailed(Event):
    lesson_id: LessonId
    reason: str


@dataclass(frozen=True, kw_only=True)
class LessonReindexRequested(Event):
    lesson_id: LessonId
    title: str
