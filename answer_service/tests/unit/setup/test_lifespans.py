"""Tests for application lifespan management."""

from unittest import mock

import pytest

from answer_service.fastapi_app import lifespan


def _make_fake_app() -> mock.Mock:
    """Build a fake FastAPI app with all required state attributes."""
    app = mock.Mock()
    app.state.dishka_container.close = mock.AsyncMock()
    app.state.task_manager.is_worker_process = False
    app.state.task_manager.startup = mock.AsyncMock()
    app.state.task_manager.shutdown = mock.AsyncMock()
    app.state.rabbit_broker.start = mock.AsyncMock()
    app.state.rabbit_broker.close = mock.AsyncMock()
    return app


async def test_lifespan_disposes_container() -> None:
    """Test that lifespan properly closes the Dishka container on shutdown."""
    # Arrange
    fake_app = _make_fake_app()

    with mock.patch("answer_service.fastapi_app.setup_faststream_dishka"):
        # Act
        async with lifespan(fake_app):
            pass

    # Assert
    fake_app.state.dishka_container.close.assert_called_once()


async def test_lifespan_clears_mappers() -> None:
    """Test that lifespan clears SQLAlchemy mappers on shutdown."""
    # Arrange
    fake_app = _make_fake_app()

    with (
        mock.patch("answer_service.fastapi_app.clear_mappers") as mock_clear_mappers,
        mock.patch("answer_service.fastapi_app.setup_faststream_dishka"),
    ):
        # Act
        async with lifespan(fake_app):
            pass

    # Assert
    mock_clear_mappers.assert_called_once()


async def test_lifespan_yields_control() -> None:
    """Test that lifespan properly yields control to the application."""
    # Arrange
    fake_app = _make_fake_app()
    executed_in_context = False

    with mock.patch("answer_service.fastapi_app.setup_faststream_dishka"):
        # Act
        async with lifespan(fake_app):
            executed_in_context = True

    # Assert
    assert executed_in_context


async def test_lifespan_starts_and_stops_rabbit_broker() -> None:
    """Test that lifespan starts the RabbitMQ broker and closes it on shutdown."""
    # Arrange
    fake_app = _make_fake_app()

    with mock.patch("answer_service.fastapi_app.setup_faststream_dishka"):
        # Act
        async with lifespan(fake_app):
            pass

    # Assert
    fake_app.state.rabbit_broker.start.assert_awaited_once()
    fake_app.state.rabbit_broker.close.assert_awaited_once()


async def test_lifespan_handles_error_during_startup() -> None:
    """Test that errors raised inside the lifespan body are propagated."""
    # Arrange
    fake_app = _make_fake_app()

    # Act & Assert
    with (
        mock.patch("answer_service.fastapi_app.setup_faststream_dishka"),
        pytest.raises(ValueError, match="Test error"),
    ):
        async with lifespan(fake_app):
            raise ValueError("Test error")

    # Teardown (after yield) is skipped when body raises; container is not closed.
    fake_app.state.dishka_container.close.assert_not_called()
