from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ConversationListItemResponse(BaseModel):
    conversation_id: UUID
    user_id: UUID
    lesson_id: UUID
    status: str
    messages_count: int
    created_at: datetime
