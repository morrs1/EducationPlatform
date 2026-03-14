from uuid import uuid4

from answer_service.domain.conversation.value_objects.conversation_id import ConversationId
from answer_service.domain.conversation.value_objects.message_id import MessageId
from answer_service.domain.lesson_index.value_objects.chunk_id import ChunkId


class UUID4ConversationIdGenerator:
    def __call__(self) -> ConversationId:
        return ConversationId(uuid4())


class UUID4MessageIdGenerator:
    def __call__(self) -> MessageId:
        return MessageId(uuid4())


class UUID4ChunkIdGenerator:
    def __call__(self) -> ChunkId:
        return ChunkId(uuid4())
