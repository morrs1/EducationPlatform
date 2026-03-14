from typing import Any

from sqlalchemy import Text, TypeDecorator
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.engine import Dialect

from answer_service.domain.conversation.value_objects.answer import Answer
from answer_service.domain.conversation.value_objects.model_name import ModelName
from answer_service.domain.conversation.value_objects.question import Question
from answer_service.domain.conversation.value_objects.token_usage import TokenUsage
from answer_service.domain.lesson_index.value_objects.chunk_content import ChunkContent


class QuestionType(TypeDecorator[Question]):
    """Persists Question VO as plain TEXT."""

    impl = Text
    cache_ok = True

    def process_bind_param(self, value: Question | None, dialect: Dialect) -> str | None:
        return value.content if value is not None else None

    def process_result_value(self, value: str | None, dialect: Dialect) -> Question | None:
        return Question(content=value) if value is not None else None


class ChunkContentType(TypeDecorator[ChunkContent]):
    """Persists ChunkContent VO as plain TEXT."""

    impl = Text
    cache_ok = True

    def process_bind_param(self, value: ChunkContent | None, dialect: Dialect) -> str | None:
        return value.content if value is not None else None

    def process_result_value(self, value: str | None, dialect: Dialect) -> ChunkContent | None:
        return ChunkContent(content=value) if value is not None else None


class AnswerType(TypeDecorator[Answer]):
    """Persists Answer VO (with nested TokenUsage and ModelName) as JSONB.

    Flattened JSON structure:
        {
            "content": str,
            "input_tokens": int,
            "output_tokens": int,
            "model_name": str,
        }
    """

    impl = JSONB
    cache_ok = True

    def process_bind_param(
        self, value: Answer | None, dialect: Dialect
    ) -> dict[str, Any] | None:
        if value is None:
            return None
        return {
            "content": value.content,
            "input_tokens": value.token_usage.input_tokens,
            "output_tokens": value.token_usage.output_tokens,
            "model_name": value.model_name.value,
        }

    def process_result_value(
        self, value: dict[str, Any] | None, dialect: Dialect
    ) -> Answer | None:
        if value is None:
            return None
        return Answer(
            content=value["content"],
            token_usage=TokenUsage(
                input_tokens=value["input_tokens"],
                output_tokens=value["output_tokens"],
            ),
            model_name=ModelName(value=value["model_name"]),
        )
