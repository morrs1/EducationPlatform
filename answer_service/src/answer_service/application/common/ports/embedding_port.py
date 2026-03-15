from abc import abstractmethod
from typing import Protocol


class EmbeddingPort(Protocol):
    @abstractmethod
    async def embed(self, text: str) -> list[float]:
        """Generate an embedding vector for a single text."""
        raise NotImplementedError

    @abstractmethod
    async def embed_many(self, texts: list[str]) -> list[list[float]]:
        """Generate embedding vectors for multiple texts in one call.

        Preserves order: result[i] corresponds to texts[i].
        """
        raise NotImplementedError
