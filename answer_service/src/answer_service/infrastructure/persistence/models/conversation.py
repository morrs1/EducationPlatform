from sqlalchemy import UUID, Column, DateTime, ForeignKey, String, Table
from sqlalchemy.orm import relationship

from answer_service.domain.conversation.entities.conversation import Conversation
from answer_service.domain.conversation.entities.message import Message
from answer_service.infrastructure.persistence.models.base import mapper_registry
from answer_service.infrastructure.persistence.models.types import (
    AnswerType,
    QuestionType,
)

conversations_table = Table(
    "conversations",
    mapper_registry.metadata,
    Column("id", UUID(as_uuid=True), primary_key=True),
    Column("user_id", UUID(as_uuid=True), nullable=False, index=True),
    Column("lesson_id", UUID(as_uuid=True), nullable=False, index=True),
    Column("status", String(50), nullable=False),
    Column("created_at", DateTime(timezone=True), nullable=False),
    Column("updated_at", DateTime(timezone=True), nullable=False),
)

messages_table = Table(
    "messages",
    mapper_registry.metadata,
    Column("id", UUID(as_uuid=True), primary_key=True),
    Column(
        "conversation_id",
        UUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    ),
    Column("question", QuestionType, nullable=False),
    # Answer is nullable: set after LLM generates the response.
    # Stored as JSONB (content + token_usage + model_name flattened).
    Column("answer", AnswerType, nullable=True),
    Column("status", String(50), nullable=False),
    Column("created_at", DateTime(timezone=True), nullable=False),
    Column("updated_at", DateTime(timezone=True), nullable=False),
)


def map_conversations_tables() -> None:
    # Message must be mapped before Conversation (relationship target).
    mapper_registry.map_imperatively(
        Message,
        messages_table,
        properties={
            "id": messages_table.c.id,
            "question": messages_table.c.question,
            "answer": messages_table.c.answer,
            "status": messages_table.c.status,
            "created_at": messages_table.c.created_at,
            "updated_at": messages_table.c.updated_at,
        },
    )
    mapper_registry.map_imperatively(
        Conversation,
        conversations_table,
        properties={
            "id": conversations_table.c.id,
            "user_id": conversations_table.c.user_id,
            "lesson_id": conversations_table.c.lesson_id,
            "status": conversations_table.c.status,
            "created_at": conversations_table.c.created_at,
            "updated_at": conversations_table.c.updated_at,
            "messages": relationship(
                Message,
                lazy="selectin",
                order_by=messages_table.c.created_at,
                cascade="all, delete-orphan",
            ),
        },
    )
