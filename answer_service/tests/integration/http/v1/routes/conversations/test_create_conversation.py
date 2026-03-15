"""Integration tests for POST /v1/conversations/."""

from uuid import uuid4

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


async def test_create_conversation_returns_201_with_conversation_id(
    client: AsyncClient,
    user_id: str,
) -> None:
    # Arrange & Act
    response = await client.post(
        "/v1/conversations/",
        json={"user_id": user_id, "lesson_id": str(uuid4())},
    )

    # Assert
    assert response.status_code == 201
    body = response.json()
    assert "conversation_id" in body
    assert len(body["conversation_id"]) == 36  # UUID string length


async def test_create_conversation_with_invalid_user_uuid_returns_422(
    client: AsyncClient,
) -> None:
    # Arrange & Act
    response = await client.post(
        "/v1/conversations/",
        json={"user_id": "not-a-uuid", "lesson_id": str(uuid4())},
    )

    # Assert
    assert response.status_code == 422


async def test_create_conversation_with_invalid_lesson_id_returns_422(
    client: AsyncClient,
    user_id: str,
) -> None:
    # Arrange & Act
    response = await client.post(
        "/v1/conversations/",
        json={"user_id": user_id, "lesson_id": "not-a-uuid"},
    )

    # Assert
    assert response.status_code == 422
