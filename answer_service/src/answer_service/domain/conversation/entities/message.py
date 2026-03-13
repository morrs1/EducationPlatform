from dataclasses import dataclass, field
from typing import final

from answer_service.domain.common.entity import Entity
from answer_service.domain.conversation.errors import MessageAlreadyProcessedError
from answer_service.domain.conversation.value_objects.answer import Answer
from answer_service.domain.conversation.value_objects.message_id import MessageId
from answer_service.domain.conversation.value_objects.question import Question
from answer_service.domain.conversation.value_objects.statuses import MessageStatus


@final
@dataclass(eq=False, kw_only=True)
class Message(Entity[MessageId]):
    question: Question
    answer: Answer | None = field(default=None)
    status: MessageStatus = field(default=MessageStatus.PENDING)

    def set_answer(self, answer: Answer) -> None:
        if self.status != MessageStatus.PENDING:
            msg = f"Cannot set answer on message with status '{self.status}'."
            raise MessageAlreadyProcessedError(msg)
        self.answer = answer
        self.status = MessageStatus.COMPLETED

    def mark_failed(self) -> None:
        self.status = MessageStatus.FAILED
