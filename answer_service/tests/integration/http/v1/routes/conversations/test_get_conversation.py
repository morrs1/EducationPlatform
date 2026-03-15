"""Integration tests for GET /v1/conversations/{conversation_id}."""

from uuid import uuid4

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


async def test_get_conversation_returns_200_with_correct_data(
    client: AsyncClient,
    user_id: str,
    conversation_id: str,
    indexed_lesson_id: str,
) -> None:
    # Arrange & Act
    response = await client.get(f"/v1/conversations/{conversation_id}")

    # Assert
    assert response.status_code == 200
    body = response.json()
    assert body["conversation_id"] == conversation_id
    assert body["user_id"] == user_id
    assert body["lesson_id"] == indexed_lesson_id
    assert body["status"] == "active"
    assert body["messages"] == []


async def test_get_conversation_messages_are_empty_on_creation(
    client: AsyncClient,
    conversation_id: str,
) -> None:
    # Arrange & Act
    response = await client.get(f"/v1/conversations/{conversation_id}")

    # Assert
    assert response.status_code == 200
    assert response.json()["messages"] == []


async def test_get_conversation_message_has_expected_fields(
    client: AsyncClient,
    conversation_id: str,
) -> None:
    # Arrange
    await client.post(
        f"/v1/conversations/{conversation_id}/ask",
        json={"question": "What is Python?"},
    )

    # Act
    response = await client.get(f"/v1/conversations/{conversation_id}")

    # Assert
    assert response.status_code == 200
    message = response.json()["messages"][0]
    assert "message_id" in message
    assert "question" in message
    assert "answer" in message
    assert "status" in message
    assert "created_at" in message


async def test_get_conversation_returns_404_when_not_exists(
    client: AsyncClient,
) -> None:
    # Arrange & Act
    response = await client.get(f"/v1/conversations/{uuid4()}")

    # Assert
    assert response.status_code == 404
    assert "detail" in response.json()


async def test_get_conversation_with_invalid_uuid_returns_422(
    client: AsyncClient,
) -> None:
    # Arrange & Act
    response = await client.get("/v1/conversations/not-a-uuid")

    # Assert
    assert response.status_code == 422
