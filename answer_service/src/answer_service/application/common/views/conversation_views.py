from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass(frozen=True, slots=True, kw_only=True)
class ConversationCreatedView:
    conversation_id: UUID


@dataclass(frozen=True, slots=True, kw_only=True)
class MessageView:
    message_id: UUID
    question: str
    answer: str | None
    status: str
    created_at: datetime


@dataclass(frozen=True, slots=True, kw_only=True)
class AnswerView:
    conversation_id: UUID
    message_id: UUID
    answer_content: str
    model_name: str
    input_tokens: int
    output_tokens: int


@dataclass(frozen=True, slots=True, kw_only=True)
class ConversationView:
    conversation_id: UUID
    user_id: UUID
    lesson_id: UUID
    status: str
    messages: list[MessageView]
    created_at: datetime


@dataclass(frozen=True, slots=True, kw_only=True)
class ConversationListItemView:
    """Lightweight view for conversation list endpoints (no messages payload)."""

    conversation_id: UUID
    user_id: UUID
    lesson_id: UUID
    status: str
    messages_count: int
    created_at: datetime
