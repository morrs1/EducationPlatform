from abc import abstractmethod
from typing import Protocol

from answer_service.domain.conversation.value_objects.conversation_id import (
    ConversationId,
)
from answer_service.domain.conversation.value_objects.message_id import MessageId


class ConversationIdGenerator(Protocol):
    @abstractmethod
    def __call__(self) -> ConversationId:
        raise NotImplementedError


class MessageIdGenerator(Protocol):
    @abstractmethod
    def __call__(self) -> MessageId:
        raise NotImplementedError
