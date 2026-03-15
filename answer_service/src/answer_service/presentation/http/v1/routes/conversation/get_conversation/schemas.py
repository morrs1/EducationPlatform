from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class MessageResponse(BaseModel):
    message_id: UUID
    question: str
    answer: str | None
    status: str
    created_at: datetime


class ConversationResponse(BaseModel):
    conversation_id: UUID
    user_id: UUID
    lesson_id: UUID
    status: str
    messages: list[MessageResponse]
    created_at: datetime
