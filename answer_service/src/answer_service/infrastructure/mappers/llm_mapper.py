from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langchain_core.messages.ai import UsageMetadata

from answer_service.application.common.ports.llm_port import LLMMessage, LLMResponse


class LLMRequestMapper:
    """Converts application-layer LLM inputs into a LangChain ``list[BaseMessage]``."""

    def map(
        self,
        system_prompt: str,
        context_chunks: list[str],
        history: list[LLMMessage],
        question: str,
    ) -> list[BaseMessage]:
        messages: list[BaseMessage] = [
            SystemMessage(content=self._build_system(system_prompt, context_chunks)),
        ]
        for msg in history:
            if msg.role == "user":
                messages.append(HumanMessage(content=msg.content))
            else:
                messages.append(AIMessage(content=msg.content))
        messages.append(HumanMessage(content=question))
        return messages

    @staticmethod
    def _build_system(system_prompt: str, context_chunks: list[str]) -> str:
        if not context_chunks:
            return system_prompt
        joined = "\n\n".join(context_chunks)
        return f"{system_prompt}\n\n---\nLesson context:\n{joined}"


class LLMResponseMapper:
    """Converts a LangChain ``AIMessage`` into a domain ``LLMResponse``."""

    def map(self, response: AIMessage, fallback_model: str) -> LLMResponse:
        usage: UsageMetadata = response.usage_metadata or UsageMetadata(
            input_tokens=0, output_tokens=0, total_tokens=0
        )
        actual_model: str = (
            response.response_metadata.get("model_name", fallback_model)
            if response.response_metadata
            else fallback_model
        )
        return LLMResponse(
            content=str(response.content),
            model_name=actual_model,
            input_tokens=usage["input_tokens"],
            output_tokens=usage["output_tokens"],
        )
