from dataclasses import dataclass
from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    String,
    Table,
)

from answer_service.infrastructure.persistence.models.base import mapper_registry


@dataclass
class InboxRecord:
    """Infrastructure-level mutable dataclass mapped to ``inbox_messages`` table."""

    message_id: str
    created_at: datetime


inbox_messages_table = Table(
    "inbox_messages",
    mapper_registry.metadata,
    Column("message_id", String(255), primary_key=True),
    Column("created_at", DateTime(timezone=True), nullable=False, index=True),
)


def map_inbox_table() -> None:
    mapper_registry.map_imperatively(
        InboxRecord,
        inbox_messages_table,
        properties={
            "message_id": inbox_messages_table.c.message_id,
            "created_at": inbox_messages_table.c.created_at,
        },
    )
