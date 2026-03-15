"""Unit tests for InboxMiddleware."""

from typing import Any
from unittest.mock import AsyncMock, MagicMock

import pytest

from answer_service.application.commands.inbox.check_inbox import (
    CheckInboxCommand,
    CheckInboxCommandHandler,
)
from answer_service.application.errors import DuplicateInboxMessageError
from answer_service.presentation.rabbitmq.v1.middlewares.inbox_middleware import (
    InboxMiddleware,
)

pytestmark = pytest.mark.asyncio(loop_scope="session")


def _make_middleware(handler: CheckInboxCommandHandler) -> InboxMiddleware:
    """Construct InboxMiddleware with a mocked ContextRepo pre-wired to handler."""
    mock_container = AsyncMock()
    mock_container.get = AsyncMock(return_value=handler)

    mock_context = MagicMock()
    mock_context.get_local.return_value = mock_container

    return InboxMiddleware(None, context=mock_context)


def _make_msg(message_id: str | None) -> Any:
    raw = MagicMock()
    raw.message_id = message_id
    msg = AsyncMock()
    msg.raw_message = raw
    return msg


async def test_calls_next_when_no_message_id() -> None:
    # Arrange
    handler = AsyncMock(spec=CheckInboxCommandHandler)
    middleware = _make_middleware(handler)
    msg = _make_msg(message_id=None)
    call_next = AsyncMock(return_value="result")

    # Act
    result = await middleware.consume_scope(call_next, msg)

    # Assert
    call_next.assert_awaited_once_with(msg)
    handler.assert_not_awaited()
    assert result == "result"


async def test_calls_handler_with_correct_command_when_message_id_present() -> None:
    # Arrange
    handler = AsyncMock(spec=CheckInboxCommandHandler)
    middleware = _make_middleware(handler)
    msg = _make_msg(message_id="msg-xyz")
    call_next = AsyncMock(return_value=None)

    # Act
    await middleware.consume_scope(call_next, msg)

    # Assert
    handler.assert_awaited_once_with(CheckInboxCommand(message_id="msg-xyz"))


async def test_acks_and_returns_none_on_duplicate() -> None:
    # Arrange
    handler = AsyncMock(spec=CheckInboxCommandHandler)
    handler.side_effect = DuplicateInboxMessageError("msg-dup")
    middleware = _make_middleware(handler)
    msg = _make_msg(message_id="msg-dup")
    call_next = AsyncMock()

    # Act
    result = await middleware.consume_scope(call_next, msg)

    # Assert
    msg.ack.assert_awaited_once()
    call_next.assert_not_awaited()
    assert result is None


async def test_calls_next_when_message_is_new() -> None:
    # Arrange
    handler = AsyncMock(spec=CheckInboxCommandHandler)
    middleware = _make_middleware(handler)
    msg = _make_msg(message_id="msg-new")
    call_next = AsyncMock(return_value="processed")

    # Act
    result = await middleware.consume_scope(call_next, msg)

    # Assert
    call_next.assert_awaited_once_with(msg)
    assert result == "processed"


async def test_does_not_ack_when_message_is_new() -> None:
    # Arrange
    handler = AsyncMock(spec=CheckInboxCommandHandler)
    middleware = _make_middleware(handler)
    msg = _make_msg(message_id="msg-new")
    call_next = AsyncMock(return_value=None)

    # Act
    await middleware.consume_scope(call_next, msg)

    # Assert
    msg.ack.assert_not_awaited()
