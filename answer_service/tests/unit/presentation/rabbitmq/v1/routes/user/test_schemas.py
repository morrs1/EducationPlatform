"""Unit tests for RabbitMQ user Pydantic schemas.

Cover alias resolution (snake_case / camelCase / pascalID variants) and
invalid-UUID rejection.
"""

from uuid import UUID

import pytest
from pydantic import BaseModel, ValidationError

from answer_service.presentation.rabbitmq.v1.routes.user.schemas import (
    UserDeletedMessage,
    UserRegisteredMessage,
)

_USER_ID: UUID = UUID("22222222-2222-2222-2222-222222222222")


@pytest.mark.parametrize(
    "schema",
    (UserRegisteredMessage, UserDeletedMessage),
)
@pytest.mark.parametrize(
    "user_id_key",
    (
        "user_id",  # snake_case (canonical)
        "userId",  # camelCase
        "userID",  # pascalID
    ),
)
def test_user_message_accepts_user_id_alias_variants(
    schema: type[BaseModel],
    user_id_key: str,
) -> None:
    # Arrange
    payload: dict[str, str] = {user_id_key: str(_USER_ID)}

    # Act
    message = schema.model_validate(payload)

    # Assert
    assert getattr(message, "user_id") == _USER_ID  # noqa: B009


@pytest.mark.parametrize(
    "schema",
    (UserRegisteredMessage, UserDeletedMessage),
)
def test_user_message_rejects_invalid_uuid(schema: type[BaseModel]) -> None:
    # Arrange
    payload: dict[str, str] = {"userId": "not-a-uuid"}

    # Act / Assert
    with pytest.raises(ValidationError) as exc_info:
        schema.model_validate(payload)
    assert any(
        "user_id" in err["loc"] or "userId" in err["loc"] or "userID" in err["loc"]
        for err in exc_info.value.errors()
    )


@pytest.mark.parametrize(
    "schema",
    (UserRegisteredMessage, UserDeletedMessage),
)
def test_user_message_rejects_missing_user_id(schema: type[BaseModel]) -> None:
    # Arrange
    payload: dict[str, str] = {}

    # Act / Assert
    with pytest.raises(ValidationError) as exc_info:
        schema.model_validate(payload)
    assert any(
        "user_id" in err["loc"] or "userId" in err["loc"] or "userID" in err["loc"]
        for err in exc_info.value.errors()
    )
