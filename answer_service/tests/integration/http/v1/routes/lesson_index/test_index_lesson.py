"""Integration tests for POST /v1/lesson/{lesson_id}/index."""

from uuid import uuid4

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


async def test_index_lesson_returns_201(client: AsyncClient) -> None:
    # Arrange & Act
    response = await client.post(
        f"/v1/lesson/{uuid4()}/index",
        json={"title": "Intro to Python", "content": "Python is a high-level language."},
    )

    # Assert
    assert response.status_code == 201


async def test_index_lesson_twice_returns_409(
    client: AsyncClient,
    indexed_lesson_id: str,
) -> None:
    # Arrange & Act
    response = await client.post(
        f"/v1/lesson/{indexed_lesson_id}/index",
        json={"title": "Intro to Python", "content": "Python is a high-level language."},
    )

    # Assert
    assert response.status_code == 409
    assert "detail" in response.json()


async def test_index_lesson_with_empty_title_returns_422(client: AsyncClient) -> None:
    # Arrange & Act
    response = await client.post(
        f"/v1/lesson/{uuid4()}/index",
        json={"title": "", "content": "Some content."},
    )

    # Assert
    assert response.status_code == 422


async def test_index_lesson_with_empty_content_returns_422(client: AsyncClient) -> None:
    # Arrange & Act
    response = await client.post(
        f"/v1/lesson/{uuid4()}/index",
        json={"title": "Valid Title", "content": ""},
    )

    # Assert
    assert response.status_code == 422


async def test_index_lesson_with_invalid_uuid_returns_422(client: AsyncClient) -> None:
    # Arrange & Act
    response = await client.post(
        "/v1/lesson/not-a-uuid/index",
        json={"title": "Valid Title", "content": "Some content."},
    )

    # Assert
    assert response.status_code == 422
