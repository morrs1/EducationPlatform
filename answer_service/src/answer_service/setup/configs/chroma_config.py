from pydantic import BaseModel, Field

from answer_service.setup.configs.consts import PORT_MAX, PORT_MIN


class ChromaConfig(BaseModel):
    host: str = Field(
        alias="CHROMA_HOST",
        default="localhost",
        description="ChromaDB HTTP server hostname.",
    )
    port: int = Field(
        alias="CHROMA_PORT",
        default=8000,
        description="ChromaDB HTTP server port.",
    )
    collection_name: str = Field(
        alias="CHROMA_COLLECTION_NAME",
        default="lesson_chunks",
        description="ChromaDB collection for lesson chunk embeddings.",
    )

    def validate_port(self) -> None:
        if not PORT_MIN <= self.port <= PORT_MAX:
            msg = f"CHROMA_PORT must be between {PORT_MIN} and {PORT_MAX}, got {self.port}."
            raise ValueError(msg)
