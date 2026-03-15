"""Shared fixtures for route integration tests."""

from uuid import uuid4

import pytest
from httpx import AsyncClient


@pytest.fixture()
async def user_id(client: AsyncClient) -> str:
    uid = str(uuid4())
    resp = await client.post("/v1/users/", json={"user_id": uid})
    assert resp.status_code == 201
    return uid


@pytest.fixture()
def indexed_lesson_id() -> str:
    return str(uuid4())


@pytest.fixture()
async def conversation_id(
    client: AsyncClient,
    user_id: str,
    indexed_lesson_id: str,
) -> str:
    resp = await client.post(
        "/v1/conversations/",
        json={"user_id": user_id, "lesson_id": indexed_lesson_id},
    )
    assert resp.status_code == 201
    return str(resp.json()["conversation_id"])


@pytest.fixture()
async def closed_conversation_id(client: AsyncClient, conversation_id: str) -> str:
    resp = await client.patch(f"/v1/conversations/{conversation_id}/close")
    assert resp.status_code == 204
    return conversation_id
