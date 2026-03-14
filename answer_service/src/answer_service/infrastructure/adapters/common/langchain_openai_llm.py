from typing import override

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langchain_core.messages.ai import UsageMetadata
from langchain_openai import ChatOpenAI

from answer_service.application.common.ports.llm_port import LLMMessage, LLMPort, LLMResponse


class LangChainOpenAILLMPort(LLMPort):
    """LLMPort backed by LangChain ChatOpenAI.

    Context chunks are appended to the system prompt so the model can ground
    its answer in the retrieved lesson fragments.
    """

    def __init__(self, llm: ChatOpenAI) -> None:
        self._llm = llm

    @override
    async def generate(
        self,
        system_prompt: str,
        history: list[LLMMessage],
        context_chunks: list[str],
        question: str,
        model_name: str,
    ) -> LLMResponse:
        messages: list[BaseMessage] = [
            SystemMessage(content=self._build_system(system_prompt, context_chunks)),
        ]
        for msg in history:
            if msg.role == "user":
                messages.append(HumanMessage(content=msg.content))
            else:
                messages.append(AIMessage(content=msg.content))
        messages.append(HumanMessage(content=question))

        response: AIMessage = await self._llm.ainvoke(messages)

        usage: UsageMetadata = response.usage_metadata or UsageMetadata(
            input_tokens=0, output_tokens=0, total_tokens=0
        )
        actual_model: str = (
            response.response_metadata.get("model_name", model_name)
            if response.response_metadata
            else model_name
        )

        return LLMResponse(
            content=str(response.content),
            model_name=actual_model,
            input_tokens=usage["input_tokens"],
            output_tokens=usage["output_tokens"],
        )

    @staticmethod
    def _build_system(system_prompt: str, context_chunks: list[str]) -> str:
        if not context_chunks:
            return system_prompt
        joined = "\n\n".join(context_chunks)
        return f"{system_prompt}\n\n---\nLesson context:\n{joined}"
