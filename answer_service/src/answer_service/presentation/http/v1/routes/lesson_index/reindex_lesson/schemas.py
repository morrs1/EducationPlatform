from pydantic import BaseModel, Field


class ReindexLessonRequest(BaseModel):
    new_content: str = Field(min_length=1)
    new_title: str | None = Field(default=None, max_length=512)
