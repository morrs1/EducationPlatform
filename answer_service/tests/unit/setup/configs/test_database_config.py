"""Tests for database configuration."""

import os
from unittest import mock

import pytest
from pydantic import ValidationError

from answer_service.setup.configs.database_config import (
    POOL_SIZE_MAX,
    PostgresConfig,
    SQLAlchemyConfig,
)


class TestPostgresConfig:
    """Tests for PostgresConfig class."""

    def test_postgres_config_valid(self) -> None:
        """Test PostgresConfig with valid values."""
        # Arrange & Act
        config = PostgresConfig(
            POSTGRES_USER="test_user",
            POSTGRES_PASSWORD="test_password",  # pragma: allowlist secret
            POSTGRES_HOST="localhost",
            POSTGRES_PORT=5432,
            POSTGRES_DB="test_db",
            POSTGRES_DRIVER="psycopg",
        )

        # Assert
        assert config.user == "test_user"
        assert config.password == "test_password"  # pragma: allowlist secret
        assert config.host == "localhost"
        assert config.port == 5432
        assert config.db_name == "test_db"
        assert config.driver == "psycopg"

    def test_postgres_config_uri_generation(self) -> None:
        """Test that PostgresConfig generates correct URI."""
        # Arrange
        config = PostgresConfig(
            POSTGRES_USER="user",
            POSTGRES_PASSWORD="pass",  # pragma: allowlist secret
            POSTGRES_HOST="localhost",
            POSTGRES_PORT=5432,
            POSTGRES_DB="mydb",
            POSTGRES_DRIVER="psycopg",
        )

        # Act
        uri = config.uri

        # Assert
        assert "postgresql+psycopg" in uri
        assert "user:pass@localhost:5432/mydb" in uri

    @mock.patch.dict(os.environ, {"POSTGRES_HOST": "env-host"})
    def test_postgres_config_host_override_from_env(self) -> None:
        """Test that POSTGRES_HOST environment variable overrides config."""
        # Arrange & Act
        config = PostgresConfig(
            POSTGRES_USER="user",
            POSTGRES_PASSWORD="pass",  # pragma: allowlist secret
            POSTGRES_HOST="localhost",  # This should be overridden
            POSTGRES_PORT=5432,
            POSTGRES_DB="db",
            POSTGRES_DRIVER="psycopg",
        )

        # Assert
        assert config.host == "env-host"

    def test_postgres_config_port_validation_valid(self) -> None:
        """Test that valid port passes validation."""
        # Arrange & Act
        config = PostgresConfig(
            POSTGRES_USER="user",
            POSTGRES_PASSWORD="pass",  # pragma: allowlist secret
            POSTGRES_HOST="localhost",
            POSTGRES_PORT=5432,  # Valid port
            POSTGRES_DB="db",
            POSTGRES_DRIVER="psycopg",
        )

        # Assert
        assert config.port == 5432

    @pytest.mark.parametrize(
        "invalid_port",
        [
            pytest.param(-1, id="negative"),
            pytest.param(0, id="zero"),
            pytest.param(65536, id="too_high"),
            pytest.param(100000, id="way_too_high"),
        ],
    )
    def test_postgres_config_port_validation_invalid(
        self,
        invalid_port: int,
    ) -> None:
        """Test that invalid ports raise ValidationError."""
        # Arrange & Act & Assert
        with pytest.raises(ValidationError):
            PostgresConfig(
                POSTGRES_USER="user",
                POSTGRES_PASSWORD="pass",  # pragma: allowlist secret
                POSTGRES_HOST="localhost",
                POSTGRES_PORT=invalid_port,
                POSTGRES_DB="db",
                POSTGRES_DRIVER="psycopg",
            )


class TestSQLAlchemyConfig:
    """Tests for SQLAlchemyConfig class."""

    def test_sqlalchemy_config_valid(self) -> None:
        """Test SQLAlchemyConfig with valid values."""
        # Arrange & Act
        config = SQLAlchemyConfig(
            DB_POOL_PRE_PING=True,
            DB_POOL_RECYCLE=3600,
            DB_POOL_SIZE=10,
            DB_POOL_MAX_OVERFLOW=20,
            DB_ECHO=False,
            DB_AUTO_FLUSH=False,
            DB_EXPIRE_ON_COMMIT=False,
            DB_FUTURE=True,
        )

        # Assert
        assert config.pool_pre_ping is True
        assert config.pool_recycle == 3600
        assert config.pool_size == 10
        assert config.max_overflow == 20
        assert config.echo is False
        assert config.auto_flush is False
        assert config.expire_on_commit is False
        assert config.future is True

    def test_sqlalchemy_config_pool_size_validation_valid(self) -> None:
        """Test that valid pool_size passes validation."""
        # Arrange & Act
        config = SQLAlchemyConfig(
            DB_POOL_PRE_PING=True,
            DB_POOL_RECYCLE=3600,
            DB_POOL_SIZE=50,  # Valid
            DB_POOL_MAX_OVERFLOW=20,
            DB_ECHO=False,
        )

        # Assert
        assert config.pool_size == 50

    @pytest.mark.parametrize(
        ("invalid_pool_size", "reason"),
        [
            pytest.param(0, "below_min"),
            pytest.param(-1, "negative"),
            pytest.param(POOL_SIZE_MAX + 1, "above_max"),
            pytest.param(10000, "way_too_high"),
        ],
    )
    def test_sqlalchemy_config_pool_size_validation_invalid(
        self,
        invalid_pool_size: int,
        reason: str,
    ) -> None:
        """Test that invalid pool_size raises ValidationError."""
        # Arrange & Act & Assert
        with pytest.raises(ValidationError):
            SQLAlchemyConfig(
                DB_POOL_PRE_PING=True,
                DB_POOL_RECYCLE=3600,
                DB_POOL_SIZE=invalid_pool_size,
                DB_POOL_MAX_OVERFLOW=20,
                DB_ECHO=False,
            )

    def test_sqlalchemy_config_pool_recycle_validation_valid(self) -> None:
        """Test that valid pool_recycle passes validation."""
        # Arrange & Act
        config = SQLAlchemyConfig(
            DB_POOL_PRE_PING=True,
            DB_POOL_RECYCLE=60,  # Valid (1 minute)
            DB_POOL_SIZE=10,
            DB_POOL_MAX_OVERFLOW=20,
            DB_ECHO=False,
        )

        # Assert
        assert config.pool_recycle == 60

    def test_sqlalchemy_config_pool_recycle_validation_invalid(self) -> None:
        """Test that invalid pool_recycle raises ValidationError."""
        # Arrange & Act & Assert
        with pytest.raises(ValidationError):
            SQLAlchemyConfig(
                DB_POOL_PRE_PING=True,
                DB_POOL_RECYCLE=-1,  # Invalid
                DB_POOL_SIZE=10,
                DB_POOL_MAX_OVERFLOW=20,
                DB_ECHO=False,
            )

    def test_sqlalchemy_config_max_overflow_validation_valid(self) -> None:
        """Test that valid max_overflow passes validation."""
        # Arrange & Act
        config = SQLAlchemyConfig(
            DB_POOL_PRE_PING=True,
            DB_POOL_RECYCLE=3600,
            DB_POOL_SIZE=10,
            DB_POOL_MAX_OVERFLOW=50,  # Valid
            DB_ECHO=False,
        )

        # Assert
        assert config.max_overflow == 50

    def test_sqlalchemy_config_max_overflow_validation_invalid(self) -> None:
        """Test that invalid max_overflow raises ValidationError."""
        # Arrange & Act & Assert
        with pytest.raises(ValidationError):
            SQLAlchemyConfig(
                DB_POOL_PRE_PING=True,
                DB_POOL_RECYCLE=3600,
                DB_POOL_SIZE=10,
                DB_POOL_MAX_OVERFLOW=-1,  # Invalid
                DB_ECHO=False,
            )

    def test_sqlalchemy_config_default_values(self) -> None:
        """Test SQLAlchemyConfig default values."""
        # Arrange & Act
        config = SQLAlchemyConfig(
            DB_POOL_PRE_PING=True,
            DB_POOL_RECYCLE=3600,
            DB_POOL_SIZE=10,
            DB_POOL_MAX_OVERFLOW=20,
            DB_ECHO=False,
        )

        # Assert - defaults
        assert config.auto_flush is False
        assert config.expire_on_commit is False
        assert config.future is True
