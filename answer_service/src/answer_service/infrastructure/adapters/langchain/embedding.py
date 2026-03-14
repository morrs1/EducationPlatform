from typing import override

from langchain_core.embeddings import Embeddings

from answer_service.application.common.ports.embedding_port import EmbeddingPort


class LangChainEmbeddingPort(EmbeddingPort):
    """EmbeddingPort backed by a LangChain Embeddings instance (e.g. OpenAIEmbeddings)."""

    def __init__(self, embeddings: Embeddings) -> None:
        self._embeddings = embeddings

    @override
    async def embed(self, text: str) -> list[float]:
        return await self._embeddings.aembed_query(text)

    @override
    async def embed_many(self, texts: list[str]) -> list[list[float]]:
        return await self._embeddings.aembed_documents(texts)
