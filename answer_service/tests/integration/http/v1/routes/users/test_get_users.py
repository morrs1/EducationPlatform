"""Integration tests for GET /v1/users/."""

from uuid import uuid4

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


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
