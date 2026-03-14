import pytest
from pydantic import ValidationError

from answer_service.setup.configs.broker_config import RabbitConfig


def _make_valid_config(**overrides: object) -> RabbitConfig:
    defaults: dict[str, object] = {
        "RABBITMQ_HOST": "localhost",
        "RABBITMQ_PORT": 5672,
        "RABBITMQ_DEFAULT_USER": "guest",
        "RABBITMQ_DEFAULT_PASS": "guest",
    }
    defaults.update(overrides)
    return RabbitConfig.model_validate(defaults)


def test_rabbit_config_valid_creates_correctly() -> None:
    # Arrange & Act
    config = _make_valid_config()

    # Assert
    assert config.host == "localhost"
    assert config.port == 5672
    assert config.user == "guest"
    assert config.password == "guest"  # pragma: allowlist secret


def test_rabbit_config_uri_contains_host_port_user() -> None:
    # Arrange
    config = _make_valid_config(
        RABBITMQ_HOST="rabbit-host",
        RABBITMQ_PORT=5672,
        RABBITMQ_DEFAULT_USER="myuser",
        RABBITMQ_DEFAULT_PASS="mypass",
    )

    # Act
    uri = config.uri

    # Assert
    assert "rabbit-host" in uri
    assert "5672" in uri
    assert "myuser" in uri


@pytest.mark.parametrize(
    "invalid_port",
    [
        pytest.param(0, id="zero"),
        pytest.param(-1, id="negative"),
        pytest.param(65536, id="too_high"),
    ],
)
def test_rabbit_config_invalid_port_raises_validation_error(invalid_port: int) -> None:
    # Arrange & Act & Assert
    with pytest.raises(ValidationError):
        _make_valid_config(RABBITMQ_PORT=invalid_port)


def test_rabbit_config_valid_port_passes() -> None:
    # Arrange & Act
    config = _make_valid_config(RABBITMQ_PORT=5672)

    # Assert
    assert config.port == 5672
