# QWEN.md - Qwen Code Assistant Guide

This file provides guidance for Qwen Code assistant when working with this project.

## Project Overview

**answer-service** - RAG-сервис для образовательной платформы. Принимает вопросы пользователей, находит релевантные фрагменты урока через векторный поиск, генерирует ответ через LLM.

**Входящие данные:** user_id, lesson_id (UUID из другого сервиса), вопрос пользователя.
**Других данных извне не приходит** — весь контент хранится и индексируется внутри сервиса.

## Project Structure

```
src/
  answer_service/
    domain/          # Business logic, entities, value objects, domain services
    application/     # Use cases, commands, queries, handlers
    infrastructure/  # Implementations of ports (DB, vector store, LLM, etc.)
    presentation/    # HTTP API (FastAPI), routes, schemas
    setup/           # Application bootstrap, DI container, config
tests/
  unit/              # Unit tests (mirror src/ structure)
  integration/       # Integration tests
  e2e/               # End-to-end tests
```

### Architecture Principles

- **Clean Architecture**: Dependencies flow inward: presentation → application → domain
- **Domain-Driven Design**: Aggregates, Entities, Value Objects, Domain Events
- **CQRS**: Commands (writes) and Queries (reads) are separated
- **Dependency Injection**: Dishka for IoC container
- **SOLID & GRASP**: Follow these principles

### Layer Responsibilities

| Layer | Responsibility | Dependencies |
|-------|---------------|--------------|
| `domain` | Business logic, entities, value objects, domain services | None (pure Python) |
| `application` | Use cases, commands, queries, handlers, ports (interfaces) | domain |
| `infrastructure` | Implementations of ports (DB, vector store, LLM, etc.) | application, domain |
| `presentation` | HTTP API (FastAPI), routes, schemas, exception handlers | application |

## Domain Model

### Core Aggregates

#### 1. User (`domain/user/`)
- **Aggregate Root**: `User`
- **Value Objects**: `UserId`
- **Events**: `UserRegistered`
- **Identity**: Comes from auth service (external)

#### 2. Conversation (`domain/conversation/`)
- **Aggregate Root**: `Conversation`
- **Entities**: `Message`
- **Value Objects**: `ConversationId`, `MessageId`, `Question`, `Answer`, `TokenUsage`, `ModelName`
- **Events**: `ConversationStarted`, `QuestionAsked`, `AnswerGenerated`, `AnswerGenerationFailed`, `ConversationClosed`
- **Factories**: `ConversationFactory` (receives `EventsCollection` via DI)
- **Domain Services**: `ContextWindowService` (selects messages for LLM context window)

#### 3. LessonIndex (`domain/lesson_index/`)
- **Aggregate Root**: `LessonIndex` (1:1 with lesson)
- **Entities**: `DocumentChunk`
- **Value Objects**: `LessonId`, `ChunkId`, `ChunkContent`, `Embedding`, `IndexStatus`
- **Events**: `LessonIndexingRequested`, `LessonIndexed`, `LessonIndexingFailed`, `LessonReindexRequested`
- **Factories**: `LessonIndexFactory` (receives `EventsCollection` via DI)
- **Domain Services**: `TextSplitterService` (splits lesson text into chunks)

### ValueObject Contract

All Value Objects must inherit from `BaseValueObject`:

```python
@dataclass(frozen=True, eq=True, unsafe_hash=True)
class ValueObject(ABC):
    def __post_init__(self) -> None:
        if not fields(self):  # guarantee at least one field
            raise DomainFieldError(...)
        self._validate()

    @abstractmethod
    def _validate(self) -> None: ...

    @abstractmethod
    def __str__(self) -> str: ...
```

**Important**: Concrete VOs do NOT override `__post_init__`, only `_validate()` and `__str__()`.

### EventsCollection Pattern

- Aggregates do NOT create `EventsCollection` themselves
- `EventsCollection` is injected via factory (Dishka, request scope)
- One `EventsCollection` per request - all events published atomically at the end

```python
# Aggregate receives events_collection explicitly:
Conversation.create(conversation_id, user_id, lesson_id, events_collection)
LessonIndex.create(lesson_id, title, events_collection)

# Factory receives EventsCollection from Dishka:
class ConversationFactory:
    def __init__(self, events_collection: EventsCollection, ...): ...
```

## Application Layer Structure

```
application/
  commands/          # Write operations (create, update, delete)
    <domain>/        # e.g., user/, conversation/, lesson_index/
      <command>.py   # Command + CommandHandler
  queries/           # Read operations
    <domain>/
      <query>.py     # Query + QueryHandler
  common/
    ports/           # Interfaces for infrastructure
    services/        # Application services
    views/           # Data transfer objects (views)
    query_params/    # Pagination, sorting, filters
  event_handlers/    # Domain event handlers
```

### Command Handler Example

```python
@dataclass(frozen=True, slots=True, kw_only=True)
class CreateUserCommand:
    email: str
    name: str
    password: str
    role: UserRole = UserRole.USER


@final
class CreateUserCommandHandler:
    def __init__(
        self,
        transaction_manager: TransactionManager,
        user_command_gateway: UserCommandGateway,
        user_service: UserService,
        event_bus: EventBus,
        current_user_service: CurrentUserService,
        access_service: AccessService,
    ) -> None:
        self._transaction_manager: Final[TransactionManager] = transaction_manager
        self._user_command_gateway: Final[UserCommandGateway] = user_command_gateway
        self._user_service: Final[UserService] = user_service
        self._event_bus: Final[EventBus] = event_bus
        self._current_user_service: Final[CurrentUserService] = current_user_service
        self._access_service: Final[AccessService] = access_service

    async def __call__(self, data: CreateUserCommand) -> CreateUserView:
        # Implementation
```

### Query Handler Example

```python
@dataclass(frozen=True, slots=True, kw_only=True)
class ReadAllUsersQuery:
    limit: int
    offset: int
    sorting_field: str
    sorting_order: SortingOrder


@final
class ReadAllUsersQueryHandler:
    def __init__(
        self,
        user_query_gateway: UserQueryGateway,
        current_user_service: CurrentUserService,
        access_service: AccessService,
    ) -> None:
        self._user_query_gateway: Final[UserQueryGateway] = user_query_gateway
        self._current_user_service: Final[CurrentUserService] = current_user_service
        self._access_service: Final[AccessService] = access_service

    async def __call__(self, data: ReadAllUsersQuery) -> list[ReadUserByIDView]:
        # Implementation
```

## Infrastructure Stack

- **Vector Store**: ChromaDB (`langchain-chroma`) - stores lesson chunk embeddings
- **Relational DB**: PostgreSQL + SQLAlchemy asyncio + asyncpg - conversations and messages
- **LLM**: via `langchain-openai`
- **HTTP**: FastAPI
- **IoC**: Dishka
- **Message Broker**: FastStream + RabbitMQ (for events)

## Presentation Layer

### HTTP Routes Structure

```
presentation/http/v1/
  common/
    routes/
      healthcheck.py   # GET /healthcheck/
      index.py         # GET /
    exception_handler.py
  middlewares/
    logging.py
  routes/
    user/
      create_user/
        handlers.py
        schemas.py
    conversation/
      ask_question/
      get_conversation/
      close_conversation/
    lesson_index/
      index_lesson/
      reindex_lesson/
      get_lesson_index_status/
```

### Route Conventions

- Each operation in its own directory (named after operation)
- `handlers.py` - defines `APIRouter` (named `<operation>_router`) and endpoint
- `schemas.py` - Pydantic `BaseModel` request/response schemas
- `__init__.py` - always empty
- Use `DishkaRoute` as `route_class` on every router
- Inject interactors via `FromDishka[HandlerType]`
- Map dataclass views to Pydantic responses explicitly (no `model_validate`)

### Exception Handling

| Exception | HTTP Status |
|-----------|-------------|
| `ConversationNotFoundError` | 404 |
| `LessonIndexNotFoundError` | 404 |
| `LessonAlreadyIndexedError` | 409 |
| `ApplicationError` (base) | 400 |
| `DomainError` | 422 |

## Testing Rules (Mandatory)

### Test Structure

- Tests mirror `src/` structure
- Use `unit/`, `integration/`, `e2e/`
- Prefer unit tests; add integration tests when behavior spans layers

### Test Style

- Use **Arrange / Act / Assert** with explicit comments
- Do not add comments in tests except parametrization case descriptions
- Name tests by behavior and expected outcome
- Keep tests deterministic, fast, and isolated from network/IO

### Mypy + Pytest Configuration

The project uses `pytest-mypy` plugin for type checking tests. Mypy is configured to:

- Allow assert statements in tests (pytest uses them for assertions)
- Handle pytest fixtures properly
- Run mypy automatically when running `pytest`

```toml
# pyproject.toml
[[tool.mypy.overrides]]
module = "tests.*"
disable_error_code = ["assert-type"]

[tool.pytest.ini_options]
addopts = ["--mypy", "--strict-markers"]
```

### Test Patterns

```python
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from answer_service.application.commands.user.create_user import (
    CreateUserCommand,
    CreateUserCommandHandler,
)


@pytest.fixture()
def handler(
    transaction_manager: TransactionManager,
    user_repository: UserRepository,
    events_collection: EventsCollection,
    event_bus: EventBus,
) -> CreateUserCommandHandler:
    return CreateUserCommandHandler(
        transaction_manager=transaction_manager,
        user_repository=user_repository,
        events_collection=events_collection,
        event_bus=event_bus,
    )


async def test_create_user_saves_and_commits(
    handler: CreateUserCommandHandler,
    user_repository: UserRepository,
    transaction_manager: TransactionManager,
    event_bus: EventBus,
) -> None:
    # Arrange
    user_id = uuid4()
    user_repository.get_by_id = AsyncMock(return_value=None)

    # Act
    await handler(CreateUserCommand(user_id=user_id))

    # Assert
    user_repository.save.assert_awaited_once()
    transaction_manager.flush.assert_awaited_once()
    transaction_manager.commit.assert_awaited_once()
    event_bus.publish.assert_awaited_once()
```

### Fixtures

Shared fixtures are in `tests/unit/application/conftest.py`:
- `events_collection`
- `transaction_manager` (AsyncMock)
- `event_bus` (AsyncMock)
- `user_repository` (AsyncMock)
- `conversation_repository` (AsyncMock)
- `embedding_port` (AsyncMock)
- `vector_search_port` (AsyncMock)
- `llm_port` (AsyncMock)
- `context_window_service` (MagicMock)
- `conversation_factory`

### Factory Functions

Test factories in `tests/unit/factories/entities.py`:
- `make_events_collection()`
- `make_user(user_id=None, events_collection=None)`
- `make_conversation(conversation_id=None, user_id=None, lesson_id=None, events_collection=None)`

## Tooling & Standards

- **Python**: 3.12
- **Task Runner**: `just` and `pre-commit`
- **Formatting & Linting**: Ruff (`ruff.toml`)
- **Type Checking**: mypy (`mypy.ini`)
- **Testing**: pytest with coverage (`pytest.ini`)
- **Security**: Bandit (`pyproject.toml`)
- **All code must be fully type annotated**
- **Avoid `typing.Any`**

### Configuration Files

| Tool | Config File | Purpose |
|------|-------------|---------|
| **mypy** | `mypy.ini` | Type checking configuration |
| **pytest** | `pytest.ini` | Test runner configuration |
| **ruff** | `ruff.toml` | Linting and formatting |
| **bandit** | `pyproject.toml` | Security scanning |

### Common Commands

```bash
# Format + lint (ruff format + ruff check + codespell)
just lint

# Type checking
just mypy

# Security check
just bandit

# Full static analysis (CI-level, before commit)
just static-analysis   # mypy + bandit + semgrep

# Run tests with mypy integration
just pytest

# Run tests with coverage
just test

# Install pre-commit hooks
just pre-commit-install

# Run pre-commit on modified files
just pre-commit

# Run pre-commit on all files
just pre-commit-all
```

### Code Quality Rules (Mandatory)

**After writing ANY code**, run in this order:

1. `just lint` - Format + lint (minimum bar)
2. `just mypy` - Type checking
3. `just bandit` - Security check
4. `just static-analysis` - Full static analysis (before commit)
5. `just pytest -v` - Run tests (if tests exist)

**Rules:**
- Fix ALL ruff and mypy errors before moving on
- Never leave type errors unresolved
- Never use `# type: ignore` without a comment explaining why
- All tests must pass before marking work done

## Key Design Decisions

### Indexing Flow (LessonIndex)

```
create() → PENDING → start_indexing() → INDEXING
→ add_chunk() × N → mark_indexed() → READY
                  → mark_failed()  → FAILED
reindex() → INDEXING (repeat if content changed)
```

### Conversation History for LLM

- `conversation.get_history(limit=10)` - last N messages
- Stored in PostgreSQL, passed to LLM context window

### ContextWindowService

Three methods for selecting messages for LLM context:
- `select_for_context(limit)` - last N messages
- `select_within_token_budget(budget)` - by token budget
- `estimate_tokens(text)` - chars/4 heuristic

### Embedding Immutability

`Embedding.vector: tuple[float, ...]` - tuple instead of list for immutability guarantee.

## Ruff Configuration for Tests

Ruff is configured to allow pytest-specific patterns in tests:

```toml
[lint.per-file-ignores]
"tests/**/*.py" = [
    "S101",     # assert statements (pytest uses them)
    "ARG001",   # unused function argument (fixtures)
    "PLR0913",  # too many arguments (many fixtures)
    "PT004",    # fixture without return (yield fixtures)
    # ... and many more pytest-specific ignores
]
```

## Qwen-Specific Guidelines

When working on this project:

1. **Always read CLAUDE.md first** - It contains the architecture documentation
2. **Follow the existing patterns** - Look at existing code for style and structure
3. **Write tests for new code** - Mirror the src/ structure in tests/
4. **Use Arrange/Act/Assert** - Comment each section in tests
5. **Type everything** - No `Any`, full type annotations
6. **Run quality checks** - `just lint`, `just mypy`, `just pytest`
7. **Keep domain pure** - No external dependencies in domain layer
8. **Use DI everywhere** - Dishka for dependency injection
9. **EventsCollection via DI** - Never create it directly in aggregates
10. **Follow naming conventions** - `<operation>_router`, `<operation>_command`, etc.
