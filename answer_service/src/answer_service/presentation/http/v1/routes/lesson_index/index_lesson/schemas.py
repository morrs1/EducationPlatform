from pydantic import BaseModel, Field


class IndexLessonRequest(BaseModel):
    title: str = Field(min_length=1, max_length=512)
    content: str = Field(min_length=1)


class ScheduleIndexLessonResponse(BaseModel):
    task_id: str
