from typing import override

from answer_service.application.common.ports.embedding_port import EmbeddingPort


class StubEmbeddingPort(EmbeddingPort):
    """Stub embedding adapter. Replace with a LangChain/OpenAI implementation."""

    @override
    async def embed(self, text: str) -> list[float]:
        raise NotImplementedError("Embedding adapter is not implemented yet.")

    @override
    async def embed_many(self, texts: list[str]) -> list[list[float]]:
        raise NotImplementedError("Embedding adapter is not implemented yet.")
