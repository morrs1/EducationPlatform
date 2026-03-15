"""Integration tests for PUT /v1/lesson/{lesson_id}/index (scheduled)."""

from uuid import uuid4

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


async def test_reindex_lesson_returns_202(client: AsyncClient) -> None:
    # Arrange & Act
    response = await client.put(
        f"/v1/lesson/{uuid4()}/index",
        json={"new_content": "Updated content about Python."},
    )

    # Assert
    assert response.status_code == 202


async def test_reindex_lesson_returns_task_id(client: AsyncClient) -> None:
    # Arrange
    lesson_id = uuid4()

    # Act
    response = await client.put(
        f"/v1/lesson/{lesson_id}/index",
        json={"new_content": "Updated content about Python."},
    )

    # Assert
    assert response.status_code == 202
    body = response.json()
    assert "task_id" in body
    assert str(lesson_id) in body["task_id"]


async def test_reindex_lesson_without_new_title_returns_202(client: AsyncClient) -> None:
    # Arrange & Act
    response = await client.put(
        f"/v1/lesson/{uuid4()}/index",
        json={"new_content": "Updated content about Python programming."},
    )

    # Assert
    assert response.status_code == 202


async def test_reindex_lesson_task_id_is_deterministic_for_same_lesson(
    client: AsyncClient,
) -> None:
    """Two PUT requests for the same lesson_id return the same task_id."""
    # Arrange
    lesson_id = uuid4()
    payload = {"new_content": "Content"}

    # Act
    resp1 = await client.put(f"/v1/lesson/{lesson_id}/index", json=payload)
    resp2 = await client.put(f"/v1/lesson/{lesson_id}/index", json=payload)

    # Assert
    assert resp1.status_code == 202
    assert resp2.status_code == 202
    assert resp1.json()["task_id"] == resp2.json()["task_id"]


async def test_reindex_lesson_with_empty_content_returns_422(client: AsyncClient) -> None:
    # Arrange & Act
    response = await client.put(
        f"/v1/lesson/{uuid4()}/index",
        json={"new_content": ""},
    )

    # Assert
    assert response.status_code == 422


async def test_reindex_lesson_with_invalid_uuid_returns_422(client: AsyncClient) -> None:
    # Arrange & Act
    response = await client.put(
        "/v1/lesson/not-a-uuid/index",
        json={"new_content": "Content.", "new_title": "Title"},
    )

    # Assert
    assert response.status_code == 422
