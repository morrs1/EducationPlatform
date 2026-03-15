from abc import abstractmethod
from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True, slots=True)
class LLMMessage:
    """A single turn in the conversation passed to the LLM."""

    role: str  # "user" | "assistant"
    content: str


@dataclass(frozen=True, slots=True)
class LLMResponse:
    content: str
    model_name: str
    input_tokens: int
    output_tokens: int


class LLMPort(Protocol):
    @abstractmethod
    async def generate(
        self,
        system_prompt: str,
        history: list[LLMMessage],
        context_chunks: list[str],
        question: str,
        model_name: str,
    ) -> LLMResponse:
        """Generate an LLM answer for the given question.

        Uses system prompt, conversation history, retrieved context chunks,
        and the current question.

        :param system_prompt: Instruction that sets the assistant's behaviour.
        :param history: Ordered list of previous Q&A turns (oldest first).
        :param context_chunks: Relevant lesson fragments retrieved from vector store.
        :param question: The current user question.
        :param model_name: LLM model identifier (e.g. "gpt-4o").
        :return: LLMResponse with content and token usage.
        """
        raise NotImplementedError
