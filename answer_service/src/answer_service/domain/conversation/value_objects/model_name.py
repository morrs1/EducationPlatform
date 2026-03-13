from dataclasses import dataclass

from answer_service.domain.common.value_object import ValueObject
from answer_service.domain.conversation.errors import EmptyModelNameError


@dataclass(frozen=True, kw_only=True)
class ModelName(ValueObject):
    value: str

    def _validate(self) -> None:
        if not self.value.strip():
            raise EmptyModelNameError("Model name cannot be empty.")

    def __str__(self) -> str:
        return self.value
