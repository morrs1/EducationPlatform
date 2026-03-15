from uuid import uuid4

from answer_service.domain.conversation.value_objects.message_id import MessageId


class UUID4MessageIdGenerator:
    def __call__(self) -> MessageId:
        return MessageId(uuid4())
