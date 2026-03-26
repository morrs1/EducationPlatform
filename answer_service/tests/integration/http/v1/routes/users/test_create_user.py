"""Integration tests for POST /v1/users/."""

from uuid import uuid4

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


async def test_create_user_returns_201(client: AsyncClient) -> None:
    # Arrange & Act
    response = await client.post("/v1/users/", json={"user_id": str(uuid4())})

    # Assert
    assert response.status_code == 201


async def test_create_user_stores_user_retrievable_via_get(client: AsyncClient) -> None:
    # Arrange
    user_id = str(uuid4())
    await client.post("/v1/users/", json={"user_id": user_id})

    # Act
    response = await client.get(f"/v1/users/{user_id}")

    # Assert
    assert response.status_code == 200
    assert response.json()["user_id"] == user_id


async def test_create_user_with_invalid_uuid_returns_422(client: AsyncClient) -> None:
    # Arrange & Act
    response = await client.post("/v1/users/", json={"user_id": "not-a-uuid"})

    # Assert
    assert response.status_code == 422
