from sqlalchemy import UUID, Column, DateTime, ForeignKey, Integer, String, Table
from sqlalchemy.orm import relationship

from answer_service.domain.lesson_index.entities.document_chunk import DocumentChunk
from answer_service.domain.lesson_index.entities.lesson_index import LessonIndex
from answer_service.infrastructure.persistence.models.base import mapper_registry
from answer_service.infrastructure.persistence.models.types import ChunkContentType

lesson_indexes_table = Table(
    "lesson_indexes",
    mapper_registry.metadata,
    Column("id", UUID(as_uuid=True), primary_key=True),  # equals LessonId (external)
    Column("title", String(512), nullable=False),
    Column("status", String(50), nullable=False),
    Column("created_at", DateTime(timezone=True), nullable=False),
    Column("updated_at", DateTime(timezone=True), nullable=False),
)

document_chunks_table = Table(
    "document_chunks",
    mapper_registry.metadata,
    Column("id", UUID(as_uuid=True), primary_key=True),
    Column(
        "lesson_index_id",
        UUID(as_uuid=True),
        ForeignKey("lesson_indexes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    ),
    Column("content", ChunkContentType, nullable=False),
    Column("position", Integer, nullable=False),
    Column("created_at", DateTime(timezone=True), nullable=False),
    Column("updated_at", DateTime(timezone=True), nullable=False),
    # NOTE: embedding is intentionally absent — stored in ChromaDB only.
)


def map_lesson_index_tables() -> None:
    # DocumentChunk must be mapped before LessonIndex (relationship target).
    # NOTE: DocumentChunk.embedding is not mapped here; it lives in ChromaDB.
    # Instances loaded from PostgreSQL will not have the `embedding` attribute set.
    mapper_registry.map_imperatively(
        DocumentChunk,
        document_chunks_table,
        properties={
            "id": document_chunks_table.c.id,
            "content": document_chunks_table.c.content,
            "position": document_chunks_table.c.position,
            "created_at": document_chunks_table.c.created_at,
            "updated_at": document_chunks_table.c.updated_at,
        },
    )
    mapper_registry.map_imperatively(
        LessonIndex,
        lesson_indexes_table,
        properties={
            "id": lesson_indexes_table.c.id,
            "title": lesson_indexes_table.c.title,
            "status": lesson_indexes_table.c.status,
            "created_at": lesson_indexes_table.c.created_at,
            "updated_at": lesson_indexes_table.c.updated_at,
            "chunks": relationship(
                DocumentChunk,
                lazy="selectin",
                order_by=document_chunks_table.c.position,
                cascade="all, delete-orphan",
            ),
        },
    )
