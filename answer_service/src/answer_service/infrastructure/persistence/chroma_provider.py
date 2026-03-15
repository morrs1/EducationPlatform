import chromadb
from chromadb.api import ClientAPI
from langchain_chroma import Chroma
from langchain_core.embeddings import Embeddings
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

from answer_service.setup.configs.chroma_config import ChromaConfig
from answer_service.setup.configs.llm_config import OpenAIConfig


def create_embedding_function(config: OpenAIConfig) -> Embeddings:
    kwargs: dict[str, object] = {
        "api_key": config.api_key.get_secret_value(),
        "model": config.embedding_model,
        "chunk_size": config.embedding_chunk_size,
    }
    if config.base_url is not None:
        kwargs["base_url"] = config.base_url
    return OpenAIEmbeddings(**kwargs)


def create_chroma_client(config: ChromaConfig) -> ClientAPI:
    return chromadb.HttpClient(host=config.host, port=config.port)


def create_chroma_vectorstore(
    config: ChromaConfig,
    chroma_client: ClientAPI,
    embedding_function: Embeddings,
) -> Chroma:
    return Chroma(
        client=chroma_client,
        collection_name=config.collection_name,
        embedding_function=embedding_function,
    )


def create_chat_openai(config: OpenAIConfig) -> ChatOpenAI:
    kwargs: dict[str, object] = {
        "api_key": config.api_key.get_secret_value(),
        "model": config.chat_model,
        "temperature": config.temperature,
    }
    if config.base_url is not None:
        kwargs["base_url"] = config.base_url
    return ChatOpenAI(**kwargs)
