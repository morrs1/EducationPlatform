import pytest

from answer_service.setup.configs.chroma_config import ChromaConfig


def test_chroma_config_defaults() -> None:
    # Arrange & Act
    config = ChromaConfig()

    # Assert
    assert config.host == "localhost"
    assert config.port == 8000
    assert config.collection_name == "lesson_chunks"


def test_chroma_config_custom_values() -> None:
    # Arrange & Act
    config = ChromaConfig(
        CHROMA_HOST="chroma-server",
        CHROMA_PORT=9000,
        CHROMA_COLLECTION_NAME="custom_collection",
    )

    # Assert
    assert config.host == "chroma-server"
    assert config.port == 9000
    assert config.collection_name == "custom_collection"


@pytest.mark.parametrize(
    "invalid_port",
    [
        pytest.param(0, id="zero"),
        pytest.param(-1, id="negative"),
        pytest.param(65536, id="too_high"),
    ],
)
def test_chroma_config_validate_port_raises_for_invalid_ports(invalid_port: int) -> None:
    # Arrange
    config = ChromaConfig(CHROMA_PORT=invalid_port)

    # Act & Assert
    with pytest.raises(ValueError):
        config.validate_port()


def test_chroma_config_validate_port_passes_for_valid_port() -> None:
    # Arrange
    config = ChromaConfig(CHROMA_PORT=8000)

    # Act & Assert
    config.validate_port()
