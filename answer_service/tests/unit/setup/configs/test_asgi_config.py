import pytest
from pydantic import ValidationError

from answer_service.setup.configs.asgi_config import ASGIConfig


def test_asgi_config_defaults() -> None:
    # Arrange & Act
    config = ASGIConfig()

    # Assert
    assert config.host == "0.0.0.0"  # noqa: S104
    assert config.port == 8080
    assert config.fastapi_debug is True


def test_asgi_config_valid_port_passes() -> None:
    # Arrange & Act
    config = ASGIConfig(UVICORN_PORT=9090)

    # Assert
    assert config.port == 9090


@pytest.mark.parametrize(
    "invalid_port",
    [
        pytest.param(0, id="zero"),
        pytest.param(-1, id="negative"),
        pytest.param(65536, id="too_high"),
    ],
)
def test_asgi_config_invalid_port_raises_validation_error(invalid_port: int) -> None:
    # Arrange & Act & Assert
    with pytest.raises(ValidationError):
        ASGIConfig(UVICORN_PORT=invalid_port)


def test_asgi_config_allow_methods_contains_standard_methods() -> None:
    # Arrange & Act
    config = ASGIConfig()

    # Assert
    assert "GET" in config.allow_methods
    assert "POST" in config.allow_methods
    assert "PUT" in config.allow_methods
    assert "PATCH" in config.allow_methods
    assert "DELETE" in config.allow_methods


def test_asgi_config_allow_headers_contains_authorization() -> None:
    # Arrange & Act
    config = ASGIConfig()

    # Assert
    assert "Authorization" in config.allow_headers
