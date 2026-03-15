from pydantic import BaseModel, Field, SecretStr


class OpenAIConfig(BaseModel):
    api_key: SecretStr = Field(
        alias="OPENAI_API_KEY",
        description="OpenAI API key.",
    )
    base_url: str | None = Field(
        alias="OPENAI_BASE_URL",
        default=None,
        description="Optional custom base URL (e.g. for OpenRouter or Azure).",
    )
    embedding_model: str = Field(
        alias="OPENAI_EMBEDDING_MODEL",
        default="text-embedding-3-small",
        description="Model used for generating embeddings.",
    )
    chat_model: str = Field(
        alias="OPENAI_CHAT_MODEL",
        default="gpt-4o",
        description="Default chat completion model.",
    )
    temperature: float = Field(
        alias="OPENAI_TEMPERATURE",
        default=0.0,
        description="Sampling temperature for chat completions.",
    )
    embedding_chunk_size: int = Field(
        alias="OPENAI_EMBEDDING_CHUNK_SIZE",
        default=100,
        description="Number of texts per batch when calling the embedding API.",
    )
