from dataclasses import dataclass

from answer_service.domain.common.value_object import ValueObject
from answer_service.domain.conversation.errors import EmptyQuestionError, QuestionTooLongError

MAX_QUESTION_LENGTH: int = 4096


@dataclass(frozen=True, kw_only=True)
class Question(ValueObject):
    content: str

    def _validate(self) -> None:
        if not self.content.strip():
            raise EmptyQuestionError("Question content cannot be empty.")
        if len(self.content) > MAX_QUESTION_LENGTH:
            msg = f"Question exceeds maximum length of {MAX_QUESTION_LENGTH} characters."
            raise QuestionTooLongError(msg)

    def __str__(self) -> str:
        return self.content
