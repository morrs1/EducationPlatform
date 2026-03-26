from uuid import UUID

from answer_service.application.common.ports.scheduler.payloads.base import TaskPayload


class IndexLessonPayload(TaskPayload):
    lesson_id: UUID
    title: str
    content: str


class ReindexLessonPayload(TaskPayload):
    lesson_id: UUID
    new_content: str
    new_title: str | None = None
