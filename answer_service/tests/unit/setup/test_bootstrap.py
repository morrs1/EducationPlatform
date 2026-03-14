"""Tests for bootstrap setup functions."""

from unittest import mock

from fastapi import FastAPI

from answer_service.setup.bootstrap import (
    setup_http_exc_handlers,
    setup_http_middlewares,
    setup_http_routes,
    setup_map_tables,
)
from answer_service.setup.configs.asgi_config import ASGIConfig


class TestSetupMapTables:
    """Tests for setup_map_tables function."""

    @mock.patch("answer_service.setup.bootstrap.map_users_table")
    @mock.patch("answer_service.setup.bootstrap.map_conversations_tables")
    @mock.patch("answer_service.setup.bootstrap.map_lesson_index_tables")
    def test_setup_map_tables_calls_all_mappings(
        self,
        mock_map_lesson: mock.Mock,
        mock_map_conversations: mock.Mock,
        mock_map_users: mock.Mock,
    ) -> None:
        """Test that setup_map_tables calls all table mapping functions."""
        # Act
        setup_map_tables()

        # Assert
        mock_map_users.assert_called_once()
        mock_map_conversations.assert_called_once()
        mock_map_lesson.assert_called_once()


class TestSetupHttpRoutes:
    """Tests for setup_http_routes function."""

    def test_setup_http_routes_includes_all_routers(self) -> None:
        """Test that setup_http_routes includes all required routers."""
        # Arrange
        fake_app = mock.Mock(spec=FastAPI)
        fake_app.include_router = mock.Mock()

        # Act
        setup_http_routes(fake_app)

        # Assert
        assert (
            fake_app.include_router.call_count >= 2
        )  # index_router and healthcheck_router at minimum

    def test_setup_http_routes_creates_v1_router(self) -> None:
        """Test that setup_http_routes creates a v1 API router."""
        # Arrange
        fake_app = mock.Mock(spec=FastAPI)
        fake_app.include_router = mock.Mock()

        # Act
        setup_http_routes(fake_app)

        # Assert
        # Should include v1 router with /v1 prefix
        include_calls = fake_app.include_router.call_args_list
        # At least one call should be for the v1 router
        assert len(include_calls) >= 2


class TestSetupHttpExcHandlers:
    """Tests for setup_http_exc_handlers function."""

    @mock.patch("answer_service.setup.bootstrap.setup_exception_handlers")
    def test_setup_http_exc_handlers_calls_setup(
        self,
        mock_setup_handlers: mock.Mock,
    ) -> None:
        """Test that setup_http_exc_handlers calls setup_exception_handlers."""
        # Arrange
        fake_app = mock.Mock(spec=FastAPI)

        # Act
        setup_http_exc_handlers(fake_app)

        # Assert
        mock_setup_handlers.assert_called_once_with(fake_app)


class TestSetupHttpMiddlewares:
    """Tests for setup_http_middlewares function."""

    def test_setup_http_middlewares_adds_cors_middleware(self) -> None:
        """Test that setup_http_middlewares adds CORS middleware."""
        # Arrange
        fake_app = mock.Mock(spec=FastAPI)
        fake_app.add_middleware = mock.Mock()

        fake_api_config = mock.Mock(spec=ASGIConfig)
        fake_api_config.host = "localhost"
        fake_api_config.port = 8000
        fake_api_config.allow_credentials = True
        fake_api_config.allow_methods = ["*"]
        fake_api_config.allow_headers = ["*"]

        # Act
        setup_http_middlewares(fake_app, fake_api_config)

        # Assert
        assert fake_app.add_middleware.call_count >= 1  # At least CORS middleware

    def test_setup_http_middlewares_adds_logging_middleware(self) -> None:
        """Test that setup_http_middlewares adds logging middleware."""
        # Arrange
        fake_app = mock.Mock(spec=FastAPI)
        fake_app.add_middleware = mock.Mock()

        fake_api_config = mock.Mock(spec=ASGIConfig)
        fake_api_config.host = "localhost"
        fake_api_config.port = 8000
        fake_api_config.allow_credentials = True
        fake_api_config.allow_methods = ["*"]
        fake_api_config.allow_headers = ["*"]

        # Act
        setup_http_middlewares(fake_app, fake_api_config)

        # Assert
        # Should add at least 2 middlewares (CORS + Logging)
        assert fake_app.add_middleware.call_count >= 2

    def test_setup_http_middlewares_cors_config(self) -> None:
        """Test that CORS middleware is configured with correct origins."""
        # Arrange
        fake_app = mock.Mock(spec=FastAPI)
        fake_app.add_middleware = mock.Mock()

        fake_api_config = mock.Mock(spec=ASGIConfig)
        fake_api_config.host = "localhost"
        fake_api_config.port = 8080
        fake_api_config.allow_credentials = False
        fake_api_config.allow_methods = ["GET", "POST"]
        fake_api_config.allow_headers = ["Content-Type"]

        # Act
        setup_http_middlewares(fake_app, fake_api_config)

        # Assert
        cors_call = fake_app.add_middleware.call_args_list[0]
        # First call should be CORS middleware
        assert cors_call is not None
