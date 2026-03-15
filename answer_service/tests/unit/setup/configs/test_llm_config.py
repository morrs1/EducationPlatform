import math

import pytest
from pydantic import SecretStr, ValidationError

from answer_service.setup.configs.llm_config import OpenAIConfig


def test_openai_config_raises_without_api_key() -> None:
    # Arrange & Act & Assert
    with pytest.raises(ValidationError):
        OpenAIConfig.model_validate({})


def test_openai_config_defaults() -> None:
    # Arrange & Act
    config = OpenAIConfig(OPENAI_API_KEY="sk-test-key")

    # Assert
    assert config.embedding_model == "text-embedding-3-small"
    assert config.chat_model == "gpt-4o"
    assert math.isclose(config.temperature, 0.0)
    assert config.embedding_chunk_size == 100
    assert config.base_url is None


def test_openai_config_custom_values() -> None:
    # Arrange & Act
    config = OpenAIConfig(
        OPENAI_API_KEY="sk-custom-key",  # pragma: allowlist secret
        OPENAI_BASE_URL="https://openrouter.ai/api/v1",
        OPENAI_EMBEDDING_MODEL="text-embedding-ada-002",
        OPENAI_CHAT_MODEL="gpt-3.5-turbo",
        OPENAI_TEMPERATURE=0.7,
        OPENAI_EMBEDDING_CHUNK_SIZE=50,
    )

    # Assert
    assert config.base_url == "https://openrouter.ai/api/v1"
    assert config.embedding_model == "text-embedding-ada-002"
    assert config.chat_model == "gpt-3.5-turbo"
    assert math.isclose(config.temperature, 0.7)
    assert config.embedding_chunk_size == 50


def test_openai_config_api_key_is_secret_str() -> None:
    # Arrange & Act
    config = OpenAIConfig(OPENAI_API_KEY="sk-secret-key")

    # Assert
    assert isinstance(config.api_key, SecretStr)
    assert config.api_key.get_secret_value() == "sk-secret-key"


def test_openai_config_base_url_is_none_by_default() -> None:
    # Arrange & Act
    config = OpenAIConfig(OPENAI_API_KEY="sk-test-key")

    # Assert
    assert config.base_url is None
