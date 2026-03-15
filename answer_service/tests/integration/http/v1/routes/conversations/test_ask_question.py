"""Integration tests for POST /v1/conversations/{conversation_id}/ask."""

from uuid import uuid4

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.integration


async def test_ask_question_returns_201_with_answer(
    client: AsyncClient,
    conversation_id: str,
) -> None:
    # Arrange & Act
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


async def test_ask_response_includes_model_name(
    client: AsyncClient,
    conversation_id: str,
) -> None:
    # Arrange & Act
    response = await client.post(
        f"/v1/conversations/{conversation_id}/ask",
        json={"question": "What is Python?"},
    )

    # Assert
    assert response.status_code == 201
    body = response.json()
    assert "model_name" in body
    assert len(body["model_name"]) > 0


async def test_ask_question_message_appears_in_conversation_history(
    client: AsyncClient,
    conversation_id: str,
) -> None:
    # Arrange
    await client.post(
        f"/v1/conversations/{conversation_id}/ask",
        json={"question": "What is Python?"},
    )

    # Act
    response = await client.get(f"/v1/conversations/{conversation_id}")

    # Assert
    assert response.status_code == 200
    assert len(response.json()["messages"]) == 1


async def test_ask_question_multiple_times_accumulates_messages(
    client: AsyncClient,
    conversation_id: str,
) -> None:
    # Arrange & Act
    for question in ("What is Python?", "How does it work?", "Give an example."):
        resp = await client.post(
            f"/v1/conversations/{conversation_id}/ask",
            json={"question": question},
        )
        assert resp.status_code == 201

    response = await client.get(f"/v1/conversations/{conversation_id}")

    # Assert
    assert len(response.json()["messages"]) == 3


async def test_ask_question_on_closed_conversation_returns_422(
    client: AsyncClient,
    closed_conversation_id: str,
) -> None:
    # Arrange & Act
    response = await client.post(
        f"/v1/conversations/{closed_conversation_id}/ask",
        json={"question": "What is Python?"},
    )

    # Assert
    assert response.status_code == 422
    assert "detail" in response.json()


async def test_ask_question_returns_404_for_nonexistent_conversation(
    client: AsyncClient,
) -> None:
    # Arrange & Act
    response = await client.post(
        f"/v1/conversations/{uuid4()}/ask",
        json={"question": "Anything?"},
    )

    # Assert
    assert response.status_code == 404


async def test_ask_question_with_empty_question_returns_422(
    client: AsyncClient,
    conversation_id: str,
) -> None:
    # Arrange & Act
    response = await client.post(
        f"/v1/conversations/{conversation_id}/ask",
        json={"question": ""},
    )

    # Assert
    assert response.status_code == 422


async def test_ask_question_with_max_length_question_returns_201(
    client: AsyncClient,
    conversation_id: str,
) -> None:
    # Arrange & Act
    response = await client.post(
        f"/v1/conversations/{conversation_id}/ask",
        json={"question": "a" * 4096},
    )

    # Assert
    assert response.status_code == 201


async def test_ask_question_over_max_length_returns_422(
    client: AsyncClient,
    conversation_id: str,
) -> None:
    # Arrange & Act
    response = await client.post(
        f"/v1/conversations/{conversation_id}/ask",
        json={"question": "a" * 4097},
    )

    # Assert
    assert response.status_code == 422
