from uuid import uuid4

from answer_service.domain.conversation.value_objects.conversation_id import (
    ConversationId,
)


class UUID4ConversationIdGenerator:
    def __call__(self) -> ConversationId:
        return ConversationId(uuid4())
