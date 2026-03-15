from dataclasses import dataclass

from answer_service.domain.common.value_object import ValueObject
from answer_service.domain.conversation.errors import EmptyAnswerError
from answer_service.domain.conversation.value_objects.model_name import ModelName
from answer_service.domain.conversation.value_objects.token_usage import TokenUsage


@dataclass(frozen=True, kw_only=True)
class Answer(ValueObject):
    content: str
    token_usage: TokenUsage
    model_name: ModelName

    def _validate(self) -> None:
        if not self.content.strip():
            msg = "Answer content cannot be empty."
            raise EmptyAnswerError(msg)

    def __str__(self) -> str:
        return self.content
