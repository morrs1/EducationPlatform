from dataclasses import dataclass
from typing import final

from answer_service.domain.common.entity import Entity
from answer_service.domain.lesson_index.value_objects.chunk_content import ChunkContent
from answer_service.domain.lesson_index.value_objects.chunk_id import ChunkId
from answer_service.domain.lesson_index.value_objects.embedding import Embedding


@final
@dataclass(eq=False, kw_only=True)
class DocumentChunk(Entity[ChunkId]):
    content: ChunkContent
    embedding: Embedding
    position: int  # order within the original lesson document
