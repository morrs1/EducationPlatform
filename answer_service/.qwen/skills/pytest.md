# Pytest Testing Skill for answer-service

## Purpose

This skill provides expertise in writing and running pytest tests for the answer-service project, following the established patterns from the PixErase reference repository.

## When to Use

Use this skill when:
- Writing new unit tests for domain, application, or infrastructure layers
- Creating integration or e2e tests
- Debugging failing tests
- Setting up test fixtures or factories
- Running pytest with mypy integration

## Test Structure

### File Organization

Tests mirror the `src/` structure:

```
tests/
  unit/
    domain/
      conversation/
        entities/
          test_conversation.py
        value_objects/
          test_question.py
        services/
          test_context_window_service.py
    application/
      commands/
        conversation/
          test_ask_question.py
        user/
          test_create_user.py
      queries/
        conversation/
          test_get_conversation.py
    infrastructure/
      repositories/
        test_conversation_repository.py
  integration/
    repositories/
      test_conversation_repository.py
    http/
      test_conversation_routes.py
  e2e/
    test_conversation_flow.py
```

### Test File Template

```python
from typing import cast
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from answer_service.application.commands.<domain>.<operation> import (
    <Operation>Command,
    <Operation>CommandHandler,
)
from answer_service.application.common.ports.<repository> import <Repository>
from answer_service.application.common.ports.event_bus import EventBus
from answer_service.application.common.ports.transaction_manager import TransactionManager
from answer_service.domain.common.events_collection import EventsCollection
from tests.unit.factories.entities import make_<entity>


@pytest.fixture()
def handler(
    transaction_manager: TransactionManager,
    repository: <Repository>,
    events_collection: EventsCollection,
    event_bus: EventBus,
) -> <Operation>CommandHandler:
    return <Operation>CommandHandler(
        transaction_manager=transaction_manager,
        repository=repository,
        events_collection=events_collection,
        event_bus=event_bus,
    )


async def test_<operation>_success(
    handler: <Operation>CommandHandler,
    repository: <Repository>,
) -> None:
    # Arrange
    command = <Operation>Command(...)

    # Act
    result = await handler(command)

    # Assert
    assert result is not None
    repository.save.assert_awaited_once()


async def test_<operation>_raises_when_not_found(
    handler: <Operation>CommandHandler,
    repository: <Repository>,
) -> None:
    # Arrange
    repository.get_by_id = AsyncMock(return_value=None)
    command = <Operation>Command(...)

    # Act / Assert
    with pytest.raises(<NotFoundError>):
        await handler(command)
```

## Fixture Patterns

### Shared Fixtures (conftest.py)

Located in `tests/unit/application/conftest.py`:

```python
from collections import deque
from typing import cast
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from answer_service.domain.common.events_collection import EventsCollection
from answer_service.domain.conversation.factories.conversation_factory import (
    ConversationFactory,
)
from answer_service.domain.conversation.value_objects.conversation_id import (
    ConversationId,
)
from answer_service.domain.conversation.value_objects.message_id import MessageId


@pytest.fixture()
def events_collection() -> EventsCollection:
    return EventsCollection(events=deque())


@pytest.fixture()
def transaction_manager() -> TransactionManager:
    return cast("TransactionManager", cast(object, AsyncMock()))


@pytest.fixture()
def event_bus() -> EventBus:
    return cast("EventBus", cast(object, AsyncMock()))


@pytest.fixture()
def repository() -> <Repository>:
    return cast("<Repository>", cast(object, AsyncMock()))


@pytest.fixture()
def conversation_factory(events_collection: EventsCollection) -> ConversationFactory:
    conversation_id_generator = cast(
        "ConversationIdGenerator", MagicMock(return_value=ConversationId(uuid4()))
    )
    message_id_generator = cast(
        "MessageIdGenerator", MagicMock(return_value=MessageId(uuid4()))
    )
    return ConversationFactory(
        events_collection=events_collection,
        conversation_id_generator=conversation_id_generator,
        message_id_generator=message_id_generator,
    )
```

### Factory Functions

Located in `tests/unit/factories/entities.py`:

```python
from collections import deque
from uuid import uuid4

from answer_service.domain.common.events_collection import EventsCollection
from answer_service.domain.conversation.entities.conversation import Conversation
from answer_service.domain.conversation.value_objects.conversation_id import (
    ConversationId,
)
from answer_service.domain.lesson_index.value_objects.lesson_id import LessonId
from answer_service.domain.user.entities.user import User
from answer_service.domain.user.value_objects.user_id import UserId


def make_events_collection() -> EventsCollection:
    return EventsCollection(events=deque())


def make_user(
    user_id: UserId | None = None,
    events_collection: EventsCollection | None = None,
) -> User:
    return User.create(
        user_id=user_id or UserId(uuid4()),
        events_collection=events_collection or make_events_collection(),
    )


def make_conversation(
    conversation_id: ConversationId | None = None,
    user_id: UserId | None = None,
    lesson_id: LessonId | None = None,
    events_collection: EventsCollection | None = None,
) -> Conversation:
    return Conversation.create(
        conversation_id=conversation_id or ConversationId(uuid4()),
        user_id=user_id or UserId(uuid4()),
        lesson_id=lesson_id or LessonId(uuid4()),
        events_collection=events_collection or make_events_collection(),
    )
```

## Test Writing Guidelines

### Arrange / Act / Assert

Always structure tests with these three phases:

```python
async def test_example() -> None:
    # Arrange
    # Set up test data, mocks, fixtures

    # Act
    # Execute the code being tested

    # Assert
    # Verify results, assertions
```

### Naming Conventions

- Test functions: `test_<operation>_<expected_behavior>()`
- Examples:
  - `test_create_user_saves_and_commits()`
  - `test_ask_question_returns_answer_view()`
  - `test_create_conversation_raises_when_user_not_found()`

### Parametrization

```python
@pytest.mark.parametrize(
    ("email", "name", "role"),
    [
        ("user1@example.com", "UserOne", UserRole.USER),
        ("user2@example.com", "UserTwo", UserRole.ADMIN),
    ],
)
async def test_create_user_various_roles(
    email: str,
    name: str,
    role: UserRole,
    handler: CreateUserCommandHandler,
) -> None:
    # Arrange
    command = CreateUserCommand(email=email, name=name, password="password", role=role)

    # Act
    result = await handler(command)

    # Assert
    assert result is not None
```

### Exception Testing

```python
async def test_create_user_already_exists(
    handler: CreateUserCommandHandler,
    user_repository: UserRepository,
) -> None:
    # Arrange
    existing_user = make_user()
    user_repository.get_by_id = AsyncMock(return_value=existing_user)

    # Act / Assert
    with pytest.raises(UserAlreadyExistsError):
        await handler(CreateUserCommand(user_id=existing_user.id))
```

### Mock Assertions

```python
# Called exactly once
repository.save.assert_awaited_once()

# Called with specific arguments
repository.save.assert_awaited_once_with(expected_user)

# Never called
repository.save.assert_not_awaited()

# Called multiple times
repository.save.assert_awaited()
```

## Running Tests

### Basic Commands

```bash
# Run all tests with mypy
just pytest

# Run with coverage
just test

# Run specific test file
just pytest tests/unit/application/commands/user/test_create_user.py

# Run specific test function
just pytest tests/unit/application/commands/user/test_create_user.py::test_create_user_saves_and_commits

# Run without mypy (faster)
just pytest-fast

# Run with verbose output
just pytest -v

# Run with coverage report
just pytest --cov=src/answer_service --cov-report=term-missing
```

### Pytest Options

```bash
# Run only unit tests
pytest -m unit

# Run only integration tests
pytest -m integration

# Run only e2e tests
pytest -m e2e

# Run tests matching keyword
pytest -k "create_user"

# Show local variables on failure
pytest -l

# Stop on first failure
pytest -x

# Run in parallel (if pytest-xdist installed)
pytest -n auto
```

## Mypy Configuration

The project uses `pytest-mypy` plugin. Mypy is configured to:

- Allow assert statements in tests
- Handle pytest fixtures properly
- Run automatically with pytest

Configuration in `pyproject.toml`:

```toml
[[tool.mypy.overrides]]
module = "tests.*"
disable_error_code = ["assert-type"]

[tool.pytest.ini_options]
addopts = ["--mypy", "--strict-markers"]
```

## Ruff Configuration for Tests

Ruff allows pytest-specific patterns in tests via per-file ignores:

```toml
[lint.per-file-ignores]
"tests/**/*.py" = [
    "S101",     # assert statements
    "ARG001",   # unused function argument (fixtures)
    "PLR0913",  # too many arguments (fixtures)
    # ... and more
]
```

## Common Patterns

### Testing Command Handlers

```python
async def test_command_handler_success(
    handler: CommandHandler,
    repository: Repository,
    transaction_manager: TransactionManager,
    event_bus: EventBus,
) -> None:
    # Arrange
    command = Command(...)

    # Act
    result = await handler(command)

    # Assert
    repository.save.assert_awaited_once()
    transaction_manager.flush.assert_awaited_once()
    transaction_manager.commit.assert_awaited_once()
    event_bus.publish.assert_awaited_once()
    assert result is not None
```

### Testing Query Handlers

```python
async def test_query_handler_success(
    handler: QueryHandler,
    repository: Repository,
) -> None:
    # Arrange
    query = Query(...)
    expected_results = [make_entity() for _ in range(3)]
    repository.read_all = AsyncMock(return_value=expected_results)

    # Act
    result = await handler(query)

    # Assert
    assert len(result) == 3
    repository.read_all.assert_awaited_once()
```

### Testing with Multiple Dependencies

```python
async def test_handler_with_multiple_dependencies(
    handler: Handler,
    repository: Repository,
    embedding_port: EmbeddingPort,
    vector_search_port: VectorSearchPort,
    llm_port: LLMPort,
    context_window_service: ContextWindowService,
) -> None:
    # Arrange
    repository.get_by_id = AsyncMock(return_value=make_conversation())
    embedding_port.embed = AsyncMock(return_value=[0.1, 0.2, 0.3])
    vector_search_port.search = AsyncMock(return_value=[])
    llm_port.generate = AsyncMock(return_value=LLMResponse(...))
    context_window_service.select = MagicMock(return_value=[])

    command = Command(...)

    # Act
    result = await handler(command)

    # Assert
    assert result is not None
```

## Troubleshooting

### Mypy Errors in Tests

If mypy reports errors about fixtures or assertions:

1. Check that the fixture has proper type hints
2. Use `cast()` for mock objects
3. Add `# type: ignore[attr-defined]` for mock assertions if needed

Example:
```python
user_repository.save.assert_awaited_once()  # type: ignore[attr-defined]
```

### Fixture Not Found

Ensure the fixture is defined in:
- The same file
- `conftest.py` in the same directory
- `conftest.py` in a parent directory

### Async Test Issues

All async tests should:
- Use `async def`
- Await async calls
- Use `pytest-asyncio` (configured with `asyncio_mode = "auto"`)

## Reference Examples

See these files for complete examples:
- `tests/unit/application/commands/user/test_create_user.py`
- `tests/unit/application/commands/conversation/test_ask_question.py`
- `tests/unit/application/commands/conversation/test_create_conversation.py`
- `tests/unit/factories/entities.py`
- `tests/unit/application/conftest.py`
