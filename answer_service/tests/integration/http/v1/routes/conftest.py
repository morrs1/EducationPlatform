"""Shared fixtures for route integration tests."""

from uuid import UUID, uuid4

import pytest
from dishka import AsyncContainer
from httpx import AsyncClient

from answer_service.application.commands.lesson_index.index_lesson import (
    IndexLessonCommand,
    IndexLessonCommandHandler,
)


@pytest.fixture()
async def user_id(client: AsyncClient) -> str:
    uid = str(uuid4())
    resp = await client.post("/v1/users/", json={"user_id": uid})
    assert resp.status_code == 201
    return uid


@pytest.fixture()
async def indexed_lesson_id(dishka_container: AsyncContainer) -> str:
    """Return the UUID of a lesson that has been fully indexed in the DB."""
    lesson_id: UUID = uuid4()
    async with dishka_container() as request_container:
        handler = await request_container.get(IndexLessonCommandHandler)
        await handler(
            IndexLessonCommand(
                lesson_id=lesson_id,
                title="Intro to Python",
                content="Python is a programming language. " * 20,
            )
        )
    return str(lesson_id)


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
