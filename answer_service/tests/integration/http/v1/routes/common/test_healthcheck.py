"""Integration tests for root and healthcheck endpoints."""

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


async def test_root_returns_200_with_message(client: AsyncClient) -> None:
    # Arrange & Act
    response = await client.get("/")

    # Assert
    assert response.status_code == 200
    assert "message" in response.json()


async def test_healthcheck_returns_200_with_success_status(client: AsyncClient) -> None:
    # Arrange & Act
    response = await client.get("/healthcheck/")

    # Assert
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "success"
    assert body["message"] == "ok"


async def test_healthcheck_is_idempotent(client: AsyncClient) -> None:
    # Arrange & Act
    first = await client.get("/healthcheck/")
    second = await client.get("/healthcheck/")

    # Assert
    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json() == second.json()
