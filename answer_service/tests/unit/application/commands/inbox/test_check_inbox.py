"""Unit tests for CheckInboxCommandHandler."""

from typing import TYPE_CHECKING, cast
from unittest.mock import AsyncMock

import pytest

from answer_service.application.commands.inbox.check_inbox import (
    CheckInboxCommand,
    CheckInboxCommandHandler,
)
from answer_service.application.common.ports.inbox_repository import InboxRepository
from answer_service.application.common.ports.transaction_manager import TransactionManager
from answer_service.application.errors import DuplicateInboxMessageError

if TYPE_CHECKING:
    from answer_service.application.common.inbox_message import InboxMessage

pytestmark = pytest.mark.asyncio(loop_scope="session")


@pytest.fixture()
def inbox_repository() -> InboxRepository:
    return cast("InboxRepository", AsyncMock())


@pytest.fixture()
def transaction_manager() -> TransactionManager:
    return cast("TransactionManager", AsyncMock())


@pytest.fixture()
def handler(
    inbox_repository: InboxRepository,
    transaction_manager: TransactionManager,
) -> CheckInboxCommandHandler:
    return CheckInboxCommandHandler(
        inbox_repository=inbox_repository,
        transaction_manager=transaction_manager,
    )


async def test_raises_duplicate_error_when_message_already_exists(
    handler: CheckInboxCommandHandler,
    inbox_repository: InboxRepository,
) -> None:
    # Arrange
    inbox_repository.exists = AsyncMock(return_value=True)

    # Act / Assert
    with pytest.raises(DuplicateInboxMessageError):
        await handler(CheckInboxCommand(message_id="msg-abc-123"))


async def test_does_not_save_when_message_already_exists(
    handler: CheckInboxCommandHandler,
    inbox_repository: InboxRepository,
) -> None:
    # Arrange
    inbox_repository.exists = AsyncMock(return_value=True)

    # Act
    with pytest.raises(DuplicateInboxMessageError):
        await handler(CheckInboxCommand(message_id="msg-abc-123"))

    # Assert
    inbox_repository.save.assert_not_awaited()


async def test_does_not_commit_when_message_already_exists(
    handler: CheckInboxCommandHandler,
    inbox_repository: InboxRepository,
    transaction_manager: TransactionManager,
) -> None:
    # Arrange
    inbox_repository.exists = AsyncMock(return_value=True)

    # Act
    with pytest.raises(DuplicateInboxMessageError):
        await handler(CheckInboxCommand(message_id="msg-abc-123"))

    # Assert
    transaction_manager.commit.assert_not_awaited()


async def test_saves_message_when_not_duplicate(
    handler: CheckInboxCommandHandler,
    inbox_repository: InboxRepository,
) -> None:
    # Arrange
    inbox_repository.exists = AsyncMock(return_value=False)

    # Act
    await handler(CheckInboxCommand(message_id="msg-new-456"))

    # Assert
    inbox_repository.save.assert_awaited_once()


async def test_commits_after_saving_new_message(
    handler: CheckInboxCommandHandler,
    inbox_repository: InboxRepository,
    transaction_manager: TransactionManager,
) -> None:
    # Arrange
    inbox_repository.exists = AsyncMock(return_value=False)

    # Act
    await handler(CheckInboxCommand(message_id="msg-new-456"))

    # Assert
    transaction_manager.commit.assert_awaited_once()


async def test_saves_before_commit(
    handler: CheckInboxCommandHandler,
    inbox_repository: InboxRepository,
    transaction_manager: TransactionManager,
) -> None:
    # Arrange
    call_order: list[str] = []
    inbox_repository.exists = AsyncMock(return_value=False)
    inbox_repository.save = AsyncMock(side_effect=lambda _msg: call_order.append("save"))
    transaction_manager.commit = AsyncMock(
        side_effect=lambda: call_order.append("commit")
    )

    # Act
    await handler(CheckInboxCommand(message_id="msg-new-456"))

    # Assert
    assert call_order == ["save", "commit"]


async def test_saved_message_has_correct_id(
    handler: CheckInboxCommandHandler,
    inbox_repository: InboxRepository,
) -> None:
    # Arrange
    message_id = "msg-new-789"
    inbox_repository.exists = AsyncMock(return_value=False)

    # Act
    await handler(CheckInboxCommand(message_id=message_id))

    # Assert
    saved: InboxMessage = inbox_repository.save.call_args.args[0]
    assert saved.message_id == message_id


async def test_does_not_raise_when_message_is_new(
    handler: CheckInboxCommandHandler,
    inbox_repository: InboxRepository,
) -> None:
    # Arrange
    inbox_repository.exists = AsyncMock(return_value=False)

    # Act / Assert — no exception raised
    await handler(CheckInboxCommand(message_id="msg-ok"))
