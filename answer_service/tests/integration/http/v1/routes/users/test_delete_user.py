"""Integration tests for DELETE /v1/users/{user_id}."""

from uuid import uuid4

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


async def test_delete_user_returns_204(client: AsyncClient, user_id: str) -> None:
    # Arrange & Act
    response = await client.delete(f"/v1/users/{user_id}")

    # Assert
    assert response.status_code == 204


async def test_delete_user_makes_user_unretrievable(
    client: AsyncClient,
    user_id: str,
) -> None:
    # Arrange
    await client.delete(f"/v1/users/{user_id}")

    # Act
    response = await client.get(f"/v1/users/{user_id}")

    # Assert
    assert response.status_code == 404


async def test_delete_nonexistent_user_returns_404(client: AsyncClient) -> None:
    # Arrange & Act
    response = await client.delete(f"/v1/users/{uuid4()}")

    # Assert
    assert response.status_code == 404
