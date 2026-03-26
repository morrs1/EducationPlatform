"""Integration tests for PATCH /v1/conversations/{conversation_id}/close."""

from uuid import uuid4

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


async def test_close_conversation_returns_204(
    client: AsyncClient,
    conversation_id: str,
) -> None:
    # Arrange & Act
    response = await client.patch(f"/v1/conversations/{conversation_id}/close")

    # Assert
    assert response.status_code == 204


async def test_close_conversation_changes_status_to_closed(
    client: AsyncClient,
    conversation_id: str,
) -> None:
    # Arrange
    await client.patch(f"/v1/conversations/{conversation_id}/close")

    # Act
    response = await client.get(f"/v1/conversations/{conversation_id}")

    # Assert
    assert response.status_code == 200
    assert response.json()["status"] == "closed"


async def test_close_already_closed_conversation_returns_422(
    client: AsyncClient,
    closed_conversation_id: str,
) -> None:
    # Arrange & Act
    response = await client.patch(f"/v1/conversations/{closed_conversation_id}/close")

    # Assert
    assert response.status_code == 422
    assert "detail" in response.json()


async def test_close_nonexistent_conversation_returns_404(
    client: AsyncClient,
) -> None:
    # Arrange & Act
    response = await client.patch(f"/v1/conversations/{uuid4()}/close")

    # Assert
    assert response.status_code == 404


async def test_close_conversation_with_invalid_uuid_returns_422(
    client: AsyncClient,
) -> None:
    # Arrange & Act
    response = await client.patch("/v1/conversations/not-a-uuid/close")

    # Assert
    assert response.status_code == 422
