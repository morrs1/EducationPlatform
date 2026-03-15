"""add_outbox_messages_table.

Revision ID: a3b7c9d1e2f4
Revises: d15f6bc208de
Create Date: 2026-03-15 12:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a3b7c9d1e2f4"
down_revision: str | Sequence[str] | None = "d15f6bc208de"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "outbox_messages",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("event_type", sa.String(length=255), nullable=False),
        sa.Column("payload", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("processed_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_outbox_messages")),
    )
    op.create_index(
        op.f("ix_outbox_messages_event_type"),
        "outbox_messages",
        ["event_type"],
        unique=False,
    )
    op.create_index(
        op.f("ix_outbox_messages_created_at"),
        "outbox_messages",
        ["created_at"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_outbox_messages_created_at"), table_name="outbox_messages")
    op.drop_index(op.f("ix_outbox_messages_event_type"), table_name="outbox_messages")
    op.drop_table("outbox_messages")
