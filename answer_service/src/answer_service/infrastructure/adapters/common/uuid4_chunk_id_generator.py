from uuid import uuid4

from answer_service.domain.lesson_index.value_objects.chunk_id import ChunkId


class UUID4ChunkIdGenerator:
    def __call__(self) -> ChunkId:
        return ChunkId(uuid4())
