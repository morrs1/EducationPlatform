"""Integration tests for /v1/users/* endpoints.

Each test runs against a real PostgreSQL instance (testcontainers) with
all HTTP layers (FastAPI, Dishka, SQLAlchemy) active.
"""

from uuid import uuid4

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


async def test_create_user_returns_201(client: AsyncClient) -> None:
    # Arrange
    user_id = str(uuid4())

    # Act
    response = await client.post("/v1/users/", json={"user_id": user_id})

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
    body = response.json()
    assert body["user_id"] == user_id


async def test_create_user_with_invalid_uuid_returns_422(client: AsyncClient) -> None:
    # Arrange & Act
    response = await client.post("/v1/users/", json={"user_id": "not-a-uuid"})

    # Assert
    assert response.status_code == 422


async def test_get_user_by_id_returns_200_with_correct_id(client: AsyncClient) -> None:
    # Arrange
    user_id = str(uuid4())
    await client.post("/v1/users/", json={"user_id": user_id})

    # Act
    response = await client.get(f"/v1/users/{user_id}")

    # Assert
    assert response.status_code == 200
    body = response.json()
    assert body["user_id"] == user_id
    assert "created_at" in body
    assert "updated_at" in body


async def test_get_user_by_id_returns_404_when_not_exists(client: AsyncClient) -> None:
    # Arrange
    nonexistent_id = str(uuid4())

    # Act
    response = await client.get(f"/v1/users/{nonexistent_id}")

    # Assert
    assert response.status_code == 404
    assert "detail" in response.json()


async def test_get_users_returns_empty_list_when_no_users(client: AsyncClient) -> None:
    # Arrange & Act
    response = await client.get("/v1/users/")

    # Assert
    assert response.status_code == 200
    assert response.json() == []


async def test_get_users_returns_all_created_users(client: AsyncClient) -> None:
    # Arrange
    ids = [str(uuid4()) for _ in range(3)]
    for uid in ids:
        await client.post("/v1/users/", json={"user_id": uid})

    # Act
    response = await client.get("/v1/users/")

    # Assert
    assert response.status_code == 200
    returned_ids = {u["user_id"] for u in response.json()}
    assert returned_ids == set(ids)


async def test_get_users_respects_limit_param(client: AsyncClient) -> None:
    # Arrange
    for _ in range(5):
        await client.post("/v1/users/", json={"user_id": str(uuid4())})

    # Act
    response = await client.get("/v1/users/?limit=2")

    # Assert
    assert response.status_code == 200
    assert len(response.json()) == 2


async def test_get_users_respects_offset_param(client: AsyncClient) -> None:
    # Arrange
    for _ in range(4):
        await client.post("/v1/users/", json={"user_id": str(uuid4())})

    # Act
    all_resp = await client.get("/v1/users/?limit=4")
    offset_resp = await client.get("/v1/users/?limit=4&offset=2")

    # Assert
    assert offset_resp.status_code == 200
    assert len(offset_resp.json()) == len(all_resp.json()) - 2


async def test_delete_user_returns_204(client: AsyncClient) -> None:
    # Arrange
    user_id = str(uuid4())
    await client.post("/v1/users/", json={"user_id": user_id})

    # Act
    response = await client.delete(f"/v1/users/{user_id}")

    # Assert
    assert response.status_code == 204


async def test_delete_user_makes_user_unretrievable(client: AsyncClient) -> None:
    # Arrange
    user_id = str(uuid4())
    await client.post("/v1/users/", json={"user_id": user_id})

    # Act
    await client.delete(f"/v1/users/{user_id}")
    response = await client.get(f"/v1/users/{user_id}")

    # Assert
    assert response.status_code == 404


async def test_delete_nonexistent_user_returns_404(client: AsyncClient) -> None:
    # Arrange
    nonexistent_id = str(uuid4())

    # Act
    response = await client.delete(f"/v1/users/{nonexistent_id}")

    # Assert
    assert response.status_code == 404
