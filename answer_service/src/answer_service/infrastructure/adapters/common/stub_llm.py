from typing import override

from answer_service.application.common.ports.llm_port import LLMMessage, LLMPort, LLMResponse


class StubLLMPort(LLMPort):
    """Stub LLM adapter. Replace with a LangChain/OpenAI implementation."""

    @override
    async def generate(
        self,
        system_prompt: str,
        history: list[LLMMessage],
        context_chunks: list[str],
        question: str,
        model_name: str,
    ) -> LLMResponse:
        raise NotImplementedError("LLM adapter is not implemented yet.")
