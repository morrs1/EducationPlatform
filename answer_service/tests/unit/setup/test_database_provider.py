"""Tests for database provider functions."""

from unittest import mock

from sqlalchemy.ext.asyncio import AsyncEngine, async_sessionmaker

from answer_service.infrastructure.persistence.provider import (
    get_engine,
    get_session,
    get_sessionmaker,
)
from answer_service.setup.configs.database_config import (
    PostgresConfig,
    SQLAlchemyConfig,
)


class TestGetEngine:
    """Tests for get_engine function."""

    @mock.patch("answer_service.infrastructure.persistence.provider.create_async_engine")
    async def test_engine_creates_async_engine(
        self,
        mock_create_engine: mock.Mock,
    ) -> None:
        """Test that get_engine creates an async engine with correct parameters."""
        # Arrange
        mock_engine = mock.AsyncMock(spec=AsyncEngine)
        mock_engine.dispose = mock.AsyncMock()
        mock_create_engine.return_value = mock_engine

        postgres_config = mock.Mock(spec=PostgresConfig)
        db_uri = (
            "postgresql+psycopg://user:pass@localhost:5432/db"  # pragma: allowlist secret
        )
        postgres_config.uri = db_uri

        alchemy_config = mock.Mock(spec=SQLAlchemyConfig)
        alchemy_config.echo = False
        alchemy_config.pool_size = 10
        alchemy_config.max_overflow = 20
        alchemy_config.pool_pre_ping = True
        alchemy_config.pool_recycle = 3600
        alchemy_config.future = True

        # Act
        async for _ in get_engine(postgres_config, alchemy_config):
            pass

        # Assert
        mock_create_engine.assert_called_once_with(
            db_uri,
            echo=False,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
            pool_recycle=3600,
            future=True,
        )

    @mock.patch("answer_service.infrastructure.persistence.provider.create_async_engine")
    async def test_engine_disposes_on_exit(
        self,
        mock_create_engine: mock.Mock,
    ) -> None:
        """Test that engine is properly disposed when exiting the context."""
        # Arrange
        mock_engine = mock.AsyncMock(spec=AsyncEngine)
        mock_engine.dispose = mock.AsyncMock()
        mock_create_engine.return_value = mock_engine

        postgres_config = mock.Mock(spec=PostgresConfig)
        postgres_config.uri = (
            "postgresql+psycopg://user:pass@localhost:5432/db"  # pragma: allowlist secret
        )

        alchemy_config = mock.Mock(spec=SQLAlchemyConfig)
        alchemy_config.echo = False
        alchemy_config.pool_size = 10
        alchemy_config.max_overflow = 20
        alchemy_config.pool_pre_ping = True
        alchemy_config.pool_recycle = 3600
        alchemy_config.future = True

        # Act
        async for _ in get_engine(postgres_config, alchemy_config):
            pass

        # Assert
        mock_engine.dispose.assert_called_once()

    @mock.patch("answer_service.infrastructure.persistence.provider.create_async_engine")
    async def test_engine_with_debug_echo(
        self,
        mock_create_engine: mock.Mock,
    ) -> None:
        """Test that engine respects echo configuration."""
        # Arrange
        mock_engine = mock.AsyncMock(spec=AsyncEngine)
        mock_engine.dispose = mock.AsyncMock()
        mock_create_engine.return_value = mock_engine

        postgres_config = mock.Mock(spec=PostgresConfig)
        postgres_config.uri = (
            "postgresql+psycopg://user:pass@localhost:5432/db"  # pragma: allowlist secret
        )

        alchemy_config = mock.Mock(spec=SQLAlchemyConfig)
        alchemy_config.echo = True  # Debug mode
        alchemy_config.pool_size = 10
        alchemy_config.max_overflow = 20
        alchemy_config.pool_pre_ping = True
        alchemy_config.pool_recycle = 3600
        alchemy_config.future = True

        # Act
        async for _ in get_engine(postgres_config, alchemy_config):
            pass

        # Assert
        mock_create_engine.assert_called_once()
        call_kwargs = mock_create_engine.call_args.kwargs
        assert call_kwargs["echo"] is True


class TestGetSessionmaker:
    """Tests for get_sessionmaker function."""

    @mock.patch("answer_service.infrastructure.persistence.provider.async_sessionmaker")
    async def test_sessionmaker_creates_factory(
        self,
        mock_sessionmaker: mock.Mock,
    ) -> None:
        """Test that get_sessionmaker creates a session factory with correct config."""
        # Arrange
        mock_factory = mock.AsyncMock(spec=async_sessionmaker)
        mock_sessionmaker.return_value = mock_factory

        mock_engine = mock.AsyncMock(spec=AsyncEngine)

        alchemy_config = mock.Mock(spec=SQLAlchemyConfig)
        alchemy_config.auto_flush = False
        alchemy_config.expire_on_commit = False

        # Act
        await get_sessionmaker(mock_engine, alchemy_config)

        # Assert
        mock_sessionmaker.assert_called_once_with(
            bind=mock_engine,
            class_=mock.ANY,  # AsyncSession class
            autoflush=False,
            expire_on_commit=False,
        )

    @mock.patch("answer_service.infrastructure.persistence.provider.async_sessionmaker")
    async def test_sessionmaker_with_custom_config(
        self,
        mock_sessionmaker: mock.Mock,
    ) -> None:
        """Test that sessionmaker respects custom configuration."""
        # Arrange
        mock_factory = mock.AsyncMock(spec=async_sessionmaker)
        mock_sessionmaker.return_value = mock_factory

        mock_engine = mock.AsyncMock(spec=AsyncEngine)

        alchemy_config = mock.Mock(spec=SQLAlchemyConfig)
        alchemy_config.auto_flush = True
        alchemy_config.expire_on_commit = True

        # Act
        await get_sessionmaker(mock_engine, alchemy_config)

        # Assert
        mock_sessionmaker.assert_called_once()
        call_kwargs = mock_sessionmaker.call_args.kwargs
        assert call_kwargs["autoflush"] is True
        assert call_kwargs["expire_on_commit"] is True


class TestGetSession:
    """Tests for get_session function."""

    async def test_session_provides_session_context(self) -> None:
        """Test that get_session provides a session context manager."""
        # Arrange
        mock_session = mock.AsyncMock()
        mock_session.__aenter__ = mock.AsyncMock(return_value=mock_session)
        mock_session.__aexit__ = mock.AsyncMock(return_value=None)

        mock_factory = mock.Mock(spec=async_sessionmaker)
        mock_factory.return_value = mock_session

        # Act
        async for session in get_session(mock_factory):
            # Assert
            assert session == mock_session

    async def test_session_closes_on_exit(self) -> None:
        """Test that session is properly closed when exiting the context."""
        # Arrange
        mock_session = mock.AsyncMock()
        mock_session.__aenter__ = mock.AsyncMock(return_value=mock_session)
        mock_session.__aexit__ = mock.AsyncMock(return_value=None)

        mock_factory = mock.Mock(spec=async_sessionmaker)
        mock_factory.return_value = mock_session

        # Act
        async for _ in get_session(mock_factory):
            pass

        # Assert
        mock_session.__aexit__.assert_called_once()
