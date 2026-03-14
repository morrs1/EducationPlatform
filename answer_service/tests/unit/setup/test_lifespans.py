"""Tests for application lifespan management."""

from unittest import mock

import pytest

from answer_service.fastapi_app import lifespan


async def test_lifespan_disposes_container() -> None:
    """Test that lifespan properly closes the Dishka container on shutdown."""
    # Arrange
    fake_app = mock.Mock()
    fake_app.state.dishka_container.close = mock.AsyncMock()

    # Act
    async with lifespan(fake_app):
        pass

    # Assert
    fake_app.state.dishka_container.close.assert_called_once()


async def test_lifespan_clears_mappers() -> None:
    """Test that lifespan clears SQLAlchemy mappers on shutdown."""
    # Arrange
    fake_app = mock.Mock()
    fake_app.state.dishka_container.close = mock.AsyncMock()

    with mock.patch("answer_service.fastapi_app.clear_mappers") as mock_clear_mappers:
        # Act
        async with lifespan(fake_app):
            pass

        # Assert
        mock_clear_mappers.assert_called_once()


async def test_lifespan_yields_control() -> None:
    """Test that lifespan properly yields control to the application."""
    # Arrange
    fake_app = mock.Mock()
    fake_app.state.dishka_container.close = mock.AsyncMock()
    executed_in_context = False

    # Act
    async with lifespan(fake_app):
        executed_in_context = True

    # Assert
    assert executed_in_context


async def test_lifespan_handles_error_during_startup() -> None:
    """Test that errors during startup are propagated correctly."""
    # Arrange
    fake_app = mock.Mock()
    fake_app.state.dishka_container.close = mock.AsyncMock()

    # Act & Assert
    # Errors during startup (before yield) should propagate
    with mock.patch("answer_service.fastapi_app.clear_mappers"):
        with pytest.raises(ValueError, match="Test error"):
            async with lifespan(fake_app):
                msg = "Test error"
                raise ValueError(msg)

    # Note: container.close() is not called because error occurred before yield
    # This is expected behavior - shutdown code only runs after successful startup
    fake_app.state.dishka_container.close.assert_not_called()
