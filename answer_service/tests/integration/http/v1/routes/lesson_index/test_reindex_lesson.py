"""Integration tests for PUT /v1/lesson/{lesson_id}/index."""

from uuid import uuid4

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


async def test_reindex_lesson_returns_204(
    client: AsyncClient,
    indexed_lesson_id: str,
) -> None:
    # Arrange & Act
    response = await client.put(
        f"/v1/lesson/{indexed_lesson_id}/index",
        json={
            "new_title": "Updated Title",
            "new_content": "Updated content about Python.",
        },
    )

    # Assert
    assert response.status_code == 204


async def test_reindex_lesson_without_new_title_returns_204(
    client: AsyncClient,
    indexed_lesson_id: str,
) -> None:
    # Arrange & Act
    response = await client.put(
        f"/v1/lesson/{indexed_lesson_id}/index",
        json={"new_content": "Updated content about Python programming."},
    )

    # Assert
    assert response.status_code == 204


async def test_reindex_lesson_status_remains_ready(
    client: AsyncClient,
    indexed_lesson_id: str,
) -> None:
    # Arrange
    await client.put(
        f"/v1/lesson/{indexed_lesson_id}/index",
        json={"new_content": "Updated Python content.", "new_title": "Updated Title"},
    )

    # Act
    response = await client.get(f"/v1/lesson/{indexed_lesson_id}/index")

    # Assert
    assert response.status_code == 200
    assert response.json()["status"] == "ready"


async def test_reindex_lesson_updates_title(
    client: AsyncClient,
    indexed_lesson_id: str,
) -> None:
    # Arrange
    new_title = "Completely New Title"
    await client.put(
        f"/v1/lesson/{indexed_lesson_id}/index",
        json={"new_content": "Updated content.", "new_title": new_title},
    )

    # Act
    response = await client.get(f"/v1/lesson/{indexed_lesson_id}/index")

    # Assert
    assert response.status_code == 200
    assert response.json()["title"] == new_title


async def test_reindex_lesson_returns_404_when_not_indexed(client: AsyncClient) -> None:
    # Arrange & Act
    response = await client.put(
        f"/v1/lesson/{uuid4()}/index",
        json={"new_title": "Title", "new_content": "Content."},
    )

    # Assert
    assert response.status_code == 404


async def test_reindex_lesson_with_empty_content_returns_422(
    client: AsyncClient,
    indexed_lesson_id: str,
) -> None:
    # Arrange & Act
    response = await client.put(
        f"/v1/lesson/{indexed_lesson_id}/index",
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
