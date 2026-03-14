from sqlalchemy import UUID, Column, DateTime, Table

from answer_service.domain.user.entities.user import User
from answer_service.infrastructure.persistence.models.base import mapper_registry

users_table = Table(
    "users",
    mapper_registry.metadata,
    Column("id", UUID(as_uuid=True), primary_key=True),
    Column("created_at", DateTime(timezone=True), nullable=False),
    Column("updated_at", DateTime(timezone=True), nullable=False),
)


def map_users_table() -> None:
    mapper_registry.map_imperatively(
        User,
        users_table,
        properties={
            "id": users_table.c.id,
            "created_at": users_table.c.created_at,
            "updated_at": users_table.c.updated_at,
        },
    )
