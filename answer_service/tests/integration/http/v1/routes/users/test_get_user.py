"""Integration tests for GET /v1/users/{user_id}."""

from uuid import uuid4

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


async def test_get_user_by_id_returns_200_with_correct_id(
    client: AsyncClient,
    user_id: str,
) -> None:
    # Arrange & Act
    response = await client.get(f"/v1/users/{user_id}")

    # Assert
    assert response.status_code == 200
    body = response.json()
    assert body["user_id"] == user_id
    assert "created_at" in body
    assert "updated_at" in body


async def test_get_user_by_id_returns_404_when_not_exists(client: AsyncClient) -> None:
    # Arrange & Act
    response = await client.get(f"/v1/users/{uuid4()}")

    # Assert
    assert response.status_code == 404
    assert "detail" in response.json()
