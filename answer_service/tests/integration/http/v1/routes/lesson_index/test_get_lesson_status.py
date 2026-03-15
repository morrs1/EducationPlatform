"""Integration tests for GET /v1/lesson/{lesson_id}/index."""

from uuid import uuid4

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


async def test_get_lesson_status_returns_ready_after_indexing(
    client: AsyncClient,
    indexed_lesson_id: str,
) -> None:
    # Arrange & Act
    response = await client.get(f"/v1/lesson/{indexed_lesson_id}/index")

    # Assert
    assert response.status_code == 200
    assert response.json()["status"] == "ready"


async def test_get_lesson_status_returns_full_schema(
    client: AsyncClient,
    indexed_lesson_id: str,
) -> None:
    # Arrange & Act
    response = await client.get(f"/v1/lesson/{indexed_lesson_id}/index")

    # Assert
    assert response.status_code == 200
    body = response.json()
    assert body["lesson_id"] == indexed_lesson_id
    assert body["title"] == "Intro to Python"
    assert "status" in body
    assert "chunks_count" in body
    assert "indexed_at" in body


async def test_get_lesson_status_chunks_count_is_positive(
    client: AsyncClient,
    indexed_lesson_id: str,
) -> None:
    # Arrange & Act
    response = await client.get(f"/v1/lesson/{indexed_lesson_id}/index")

    # Assert
    assert response.status_code == 200
    assert response.json()["chunks_count"] > 0


async def test_get_lesson_status_indexed_at_is_not_none(
    client: AsyncClient,
    indexed_lesson_id: str,
) -> None:
    # Arrange & Act
    response = await client.get(f"/v1/lesson/{indexed_lesson_id}/index")

    # Assert
    assert response.status_code == 200
    assert response.json()["indexed_at"] is not None


async def test_get_lesson_status_returns_404_when_not_indexed(
    client: AsyncClient,
) -> None:
    # Arrange & Act
    response = await client.get(f"/v1/lesson/{uuid4()}/index")

    # Assert
    assert response.status_code == 404
    assert "detail" in response.json()


async def test_get_lesson_status_with_invalid_uuid_returns_422(
    client: AsyncClient,
) -> None:
    # Arrange & Act
    response = await client.get("/v1/lesson/not-a-uuid/index")

    # Assert
    assert response.status_code == 422
