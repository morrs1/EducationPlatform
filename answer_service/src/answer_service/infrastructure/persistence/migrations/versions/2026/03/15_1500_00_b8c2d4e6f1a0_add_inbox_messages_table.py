"""add_inbox_messages_table.

Revision ID: b8c2d4e6f1a0
Revises: a3b7c9d1e2f4
Create Date: 2026-03-15 15:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b8c2d4e6f1a0"
down_revision: str | Sequence[str] | None = "a3b7c9d1e2f4"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "inbox_messages",
        sa.Column("message_id", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("message_id", name=op.f("pk_inbox_messages")),
    )
    op.create_index(
        op.f("ix_inbox_messages_created_at"),
        "inbox_messages",
        ["created_at"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_inbox_messages_created_at"), table_name="inbox_messages")
    op.drop_table("inbox_messages")
