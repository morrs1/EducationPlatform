from uuid import UUID

from pydantic import BaseModel


class CreateConversationRequest(BaseModel):
    user_id: UUID
    lesson_id: UUID


class CreateConversationResponse(BaseModel):
    conversation_id: UUID
