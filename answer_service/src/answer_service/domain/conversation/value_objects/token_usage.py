from dataclasses import dataclass

from answer_service.domain.common.value_object import ValueObject
from answer_service.domain.conversation.errors import NegativeTokenCountError


@dataclass(frozen=True, kw_only=True)
class TokenUsage(ValueObject):
    input_tokens: int
    output_tokens: int

    @property
    def total_tokens(self) -> int:
        return self.input_tokens + self.output_tokens

    def _validate(self) -> None:
        if self.input_tokens < 0:
            msg = f"input_tokens must be >= 0, got {self.input_tokens}."
            raise NegativeTokenCountError(msg)
        if self.output_tokens < 0:
            msg = f"output_tokens must be >= 0, got {self.output_tokens}."
            raise NegativeTokenCountError(msg)

    def __str__(self) -> str:
        return (
            f"TokenUsage(input={self.input_tokens}, "
            f"output={self.output_tokens}, "
            f"total={self.total_tokens})"
        )
