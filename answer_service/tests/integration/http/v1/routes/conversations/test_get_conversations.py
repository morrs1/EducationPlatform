"""Integration tests for GET /v1/conversations/."""

from uuid import uuid4

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


async def test_get_conversations_returns_empty_list_for_new_user(
    client: AsyncClient,
    user_id: str,
) -> None:
    # Arrange & Act
    response = await client.get(f"/v1/conversations/?user_id={user_id}")

    # Assert
    assert response.status_code == 200
    assert response.json() == []


async def test_get_conversations_returns_user_conversations(
    client: AsyncClient,
    user_id: str,
) -> None:
    # Arrange
    for _ in range(3):
        await client.post(
            "/v1/conversations/",
            json={"user_id": user_id, "lesson_id": str(uuid4())},
        )

    # Act
    response = await client.get(f"/v1/conversations/?user_id={user_id}")

    # Assert
    assert response.status_code == 200
    assert len(response.json()) == 3


async def test_get_conversations_does_not_return_other_users_data(
    client: AsyncClient,
) -> None:
    # Arrange
    user_a = str(uuid4())
    user_b = str(uuid4())
    await client.post("/v1/users/", json={"user_id": user_a})
    await client.post("/v1/users/", json={"user_id": user_b})
    await client.post(
        "/v1/conversations/",
        json={"user_id": user_a, "lesson_id": str(uuid4())},
    )

    # Act
    response = await client.get(f"/v1/conversations/?user_id={user_b}")

    # Assert
    assert response.status_code == 200
    assert response.json() == []


async def test_get_conversations_list_item_has_messages_count(
    client: AsyncClient,
    user_id: str,
    conversation_id: str,
) -> None:
    # Arrange
    await client.post(
        f"/v1/conversations/{conversation_id}/ask",
        json={"question": "What is Python?"},
    )

    # Act
    response = await client.get(f"/v1/conversations/?user_id={user_id}")

    # Assert
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 1
    assert items[0]["messages_count"] == 1


async def test_get_conversations_with_sorting_order_asc_returns_200(
    client: AsyncClient,
    user_id: str,
    indexed_lesson_id: str,
) -> None:
    # Arrange
    for _ in range(3):
        await client.post(
            "/v1/conversations/",
            json={"user_id": user_id, "lesson_id": indexed_lesson_id},
        )

    # Act
    response = await client.get(f"/v1/conversations/?user_id={user_id}&sorting_order=ASC")

    # Assert
    assert response.status_code == 200
    assert len(response.json()) == 3


async def test_get_conversations_with_invalid_user_id_returns_422(
    client: AsyncClient,
) -> None:
    # Arrange & Act
    response = await client.get("/v1/conversations/?user_id=not-a-uuid")

    # Assert
    assert response.status_code == 422
