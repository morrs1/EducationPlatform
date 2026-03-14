"""Integration tests for /v1/conversations/* and /v1/lesson/* endpoints.

Tests exercise the full request pipeline: FastAPI → Dishka → Application
layer → Real PostgreSQL + FakeEmbeddingPort/FakeLLMPort/FakeVectorSearchPort.
"""

from uuid import uuid4

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


async def _create_user(client: AsyncClient) -> str:
    user_id = str(uuid4())
    resp = await client.post("/v1/users/", json={"user_id": user_id})
    assert resp.status_code == 201, resp.text
    return user_id


async def _index_lesson(client: AsyncClient, lesson_id: str) -> None:
    resp = await client.post(
        f"/v1/lesson/{lesson_id}/index",
        json={
            "title": "Test Lesson",
            "content": "Python is a programming language. It is widely used.",
        },
    )
    assert resp.status_code == 201, resp.text


async def _create_conversation(client: AsyncClient, user_id: str, lesson_id: str) -> str:
    resp = await client.post(
        "/v1/conversations/",
        json={"user_id": user_id, "lesson_id": lesson_id},
    )
    assert resp.status_code == 201, resp.text
    return str(resp.json()["conversation_id"])


async def test_index_lesson_returns_201(client: AsyncClient) -> None:
    # Arrange
    lesson_id = str(uuid4())

    # Act
    response = await client.post(
        f"/v1/lesson/{lesson_id}/index",
        json={"title": "Intro to Python", "content": "Python is a high-level language."},
    )

    # Assert
    assert response.status_code == 201


async def test_index_lesson_twice_returns_409(client: AsyncClient) -> None:
    # Arrange
    lesson_id = str(uuid4())
    await _index_lesson(client, lesson_id)

    # Act
    response = await client.post(
        f"/v1/lesson/{lesson_id}/index",
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


async def test_get_lesson_index_status_returns_ready_after_indexing(
    client: AsyncClient,
) -> None:
    # Arrange
    lesson_id = str(uuid4())
    await _index_lesson(client, lesson_id)

    # Act
    response = await client.get(f"/v1/lesson/{lesson_id}/status")

    # Assert
    assert response.status_code == 200
    assert response.json()["status"] == "ready"


async def test_get_lesson_index_status_returns_404_when_not_indexed(
    client: AsyncClient,
) -> None:
    # Arrange
    nonexistent_lesson_id = str(uuid4())

    # Act
    response = await client.get(f"/v1/lesson/{nonexistent_lesson_id}/status")

    # Assert
    assert response.status_code == 404
    assert "detail" in response.json()


async def test_reindex_lesson_returns_204(client: AsyncClient) -> None:
    # Arrange
    lesson_id = str(uuid4())
    await _index_lesson(client, lesson_id)

    # Act
    response = await client.put(
        f"/v1/lesson/{lesson_id}/index",
        json={
            "new_title": "Updated Title",
            "new_content": "Updated content about Python.",
        },
    )

    # Assert
    assert response.status_code == 204


async def test_reindex_lesson_returns_404_when_not_indexed(client: AsyncClient) -> None:
    # Arrange
    nonexistent_lesson_id = str(uuid4())

    # Act
    response = await client.put(
        f"/v1/lesson/{nonexistent_lesson_id}/index",
        json={"new_title": "Title", "new_content": "Content."},
    )

    # Assert
    assert response.status_code == 404


async def test_create_conversation_returns_201_with_conversation_id(
    client: AsyncClient,
) -> None:
    # Arrange
    user_id = await _create_user(client)
    lesson_id = str(uuid4())

    # Act
    response = await client.post(
        "/v1/conversations/",
        json={"user_id": user_id, "lesson_id": lesson_id},
    )

    # Assert
    assert response.status_code == 201
    body = response.json()
    assert "conversation_id" in body
    assert len(body["conversation_id"]) == 36  # UUID string length


async def test_create_conversation_with_invalid_user_uuid_returns_422(
    client: AsyncClient,
) -> None:
    # Arrange & Act
    response = await client.post(
        "/v1/conversations/",
        json={"user_id": "not-a-uuid", "lesson_id": str(uuid4())},
    )

    # Assert
    assert response.status_code == 422


async def test_get_conversation_returns_200_with_correct_data(
    client: AsyncClient,
) -> None:
    # Arrange
    user_id = await _create_user(client)
    lesson_id = str(uuid4())
    conversation_id = await _create_conversation(client, user_id, lesson_id)

    # Act
    response = await client.get(f"/v1/conversations/{conversation_id}")

    # Assert
    assert response.status_code == 200
    body = response.json()
    assert body["conversation_id"] == conversation_id
    assert body["user_id"] == user_id
    assert body["lesson_id"] == lesson_id
    assert body["status"] == "active"
    assert body["messages"] == []


async def test_get_conversation_returns_404_when_not_exists(client: AsyncClient) -> None:
    # Arrange
    nonexistent_id = str(uuid4())

    # Act
    response = await client.get(f"/v1/conversations/{nonexistent_id}")

    # Assert
    assert response.status_code == 404
    assert "detail" in response.json()


async def test_get_conversations_returns_empty_list_for_new_user(
    client: AsyncClient,
) -> None:
    # Arrange
    user_id = await _create_user(client)

    # Act
    response = await client.get(f"/v1/conversations/?user_id={user_id}")

    # Assert
    assert response.status_code == 200
    assert response.json() == []


async def test_get_conversations_returns_user_conversations(client: AsyncClient) -> None:
    # Arrange
    user_id = await _create_user(client)
    lesson_ids = [str(uuid4()) for _ in range(3)]
    for lid in lesson_ids:
        await _create_conversation(client, user_id, lid)

    # Act
    response = await client.get(f"/v1/conversations/?user_id={user_id}")

    # Assert
    assert response.status_code == 200
    assert len(response.json()) == 3


async def test_get_conversations_does_not_return_other_users_data(
    client: AsyncClient,
) -> None:
    # Arrange
    user_a = await _create_user(client)
    user_b = await _create_user(client)
    await _create_conversation(client, user_a, str(uuid4()))

    # Act
    response = await client.get(f"/v1/conversations/?user_id={user_b}")

    # Assert
    assert response.status_code == 200
    assert response.json() == []


async def test_close_conversation_returns_204(client: AsyncClient) -> None:
    # Arrange
    user_id = await _create_user(client)
    conversation_id = await _create_conversation(client, user_id, str(uuid4()))

    # Act
    response = await client.patch(f"/v1/conversations/{conversation_id}/close")

    # Assert
    assert response.status_code == 204


async def test_close_conversation_changes_status_to_closed(client: AsyncClient) -> None:
    # Arrange
    user_id = await _create_user(client)
    conversation_id = await _create_conversation(client, user_id, str(uuid4()))

    # Act
    await client.patch(f"/v1/conversations/{conversation_id}/close")
    response = await client.get(f"/v1/conversations/{conversation_id}")

    # Assert
    assert response.status_code == 200
    assert response.json()["status"] == "closed"


async def test_close_nonexistent_conversation_returns_404(client: AsyncClient) -> None:
    # Arrange
    nonexistent_id = str(uuid4())

    # Act
    response = await client.patch(f"/v1/conversations/{nonexistent_id}/close")

    # Assert
    assert response.status_code == 404


async def test_ask_question_returns_201_with_answer(client: AsyncClient) -> None:
    # Arrange
    user_id = await _create_user(client)
    lesson_id = str(uuid4())
    await _index_lesson(client, lesson_id)
    conversation_id = await _create_conversation(client, user_id, lesson_id)

    # Act
    response = await client.post(
        f"/v1/conversations/{conversation_id}/ask",
        json={"question": "What is Python?"},
    )

    # Assert
    assert response.status_code == 201
    body = response.json()
    assert body["conversation_id"] == conversation_id
    assert "message_id" in body
    assert "answer_content" in body
    assert len(body["answer_content"]) > 0
    assert body["input_tokens"] >= 0
    assert body["output_tokens"] >= 0


async def test_ask_question_message_appears_in_conversation_history(
    client: AsyncClient,
) -> None:
    # Arrange
    user_id = await _create_user(client)
    lesson_id = str(uuid4())
    await _index_lesson(client, lesson_id)
    conversation_id = await _create_conversation(client, user_id, lesson_id)
    await client.post(
        f"/v1/conversations/{conversation_id}/ask",
        json={"question": "What is Python?"},
    )

    # Act
    response = await client.get(f"/v1/conversations/{conversation_id}")

    # Assert
    assert response.status_code == 200
    messages = response.json()["messages"]
    assert len(messages) == 1


async def test_ask_question_multiple_times_accumulates_messages(
    client: AsyncClient,
) -> None:
    # Arrange
    user_id = await _create_user(client)
    lesson_id = str(uuid4())
    await _index_lesson(client, lesson_id)
    conversation_id = await _create_conversation(client, user_id, lesson_id)

    # Act
    for question in ("What is Python?", "How does it work?", "Give an example."):
        resp = await client.post(
            f"/v1/conversations/{conversation_id}/ask",
            json={"question": question},
        )
        assert resp.status_code == 201

    response = await client.get(f"/v1/conversations/{conversation_id}")

    # Assert
    assert len(response.json()["messages"]) == 3


async def test_ask_question_returns_404_for_nonexistent_conversation(
    client: AsyncClient,
) -> None:
    # Arrange
    nonexistent_id = str(uuid4())

    # Act
    response = await client.post(
        f"/v1/conversations/{nonexistent_id}/ask",
        json={"question": "Anything?"},
    )

    # Assert
    assert response.status_code == 404


async def test_ask_question_with_empty_question_returns_422(client: AsyncClient) -> None:
    # Arrange
    user_id = await _create_user(client)
    lesson_id = str(uuid4())
    await _index_lesson(client, lesson_id)
    conversation_id = await _create_conversation(client, user_id, lesson_id)

    # Act
    response = await client.post(
        f"/v1/conversations/{conversation_id}/ask",
        json={"question": ""},
    )

    # Assert
    assert response.status_code == 422
