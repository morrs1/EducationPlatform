from pydantic import BaseModel, Field
from uuid import UUID


class AskQuestionRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4096)


class AnswerResponse(BaseModel):
    conversation_id: UUID
    message_id: UUID
    answer_content: str
    model_name: str
    input_tokens: int
    output_tokens: int
