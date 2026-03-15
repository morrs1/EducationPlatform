from typing import Final, override

from langchain_openai import ChatOpenAI

from answer_service.application.common.ports.llm_port import (
    LLMMessage,
    LLMPort,
    LLMResponse,
)
from answer_service.infrastructure.mappers.llm_mapper import (
    LLMRequestMapper,
    LLMResponseMapper,
)


class LangChainOpenAILLMPort(LLMPort):
    """LLMPort backed by LangChain ChatOpenAI.

    Context chunks are appended to the system prompt so the model can ground
    its answer in the retrieved lesson fragments.
    """

    def __init__(
        self,
        llm: ChatOpenAI,
        request_mapper: LLMRequestMapper,
        response_mapper: LLMResponseMapper,
    ) -> None:
        self._llm: Final[ChatOpenAI] = llm
        self._request_mapper: Final[LLMRequestMapper] = request_mapper
        self._response_mapper: Final[LLMResponseMapper] = response_mapper

    @override
    async def generate(
        self,
        system_prompt: str,
        history: list[LLMMessage],
        context_chunks: list[str],
        question: str,
        model_name: str,
    ) -> LLMResponse:
        messages = self._request_mapper.map(
            system_prompt=system_prompt,
            context_chunks=context_chunks,
            history=history,
            question=question,
        )
        response = await self._llm.ainvoke(messages)
        return self._response_mapper.map(response, fallback_model=model_name)
