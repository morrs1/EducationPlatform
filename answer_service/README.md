<h2 align="center">Answer Service</h2>

*A RAG (Retrieval-Augmented Generation) microservice for the Education Platform — answers student questions by finding relevant lesson fragments via vector search and generating responses through an LLM.*

Built using the principles of Robert Martin (aka Uncle Bob) and Domain-Driven Design (DDD).

---

## Overview

The Answer Service accepts a user question together with a `lesson_id`, retrieves the most relevant document chunks from a vector store (ChromaDB), and generates a grounded answer via OpenAI. All lesson content is indexed and managed internally — no raw content is expected from callers at query time.

### Data flow

```
HTTP client  →  POST /v1/conversations/ask
                    │
                    ▼
             AskQuestionCommandHandler
                    │
          ┌─────────┴──────────┐
          ▼                    ▼
  VectorSearchPort         LLMPort
  (ChromaDB chunks)    (OpenAI completion)
          │                    │
          └─────────┬──────────┘
                    ▼
           Answer saved to PostgreSQL
           Domain events → Outbox → RabbitMQ
```

### Indexing flow

```
RabbitMQ: lesson.created / lesson.updated
          │
          ▼
ScheduleIndex(Reindex)LessonCommandHandler
          │
          ▼  (TaskIQ background task)
IndexLessonCommandHandler
          │
    TextSplitterService  →  chunks
          │
    EmbeddingPort        →  vectors
          │
    ChromaDB             ←  stored
          │
    LessonIndex (PostgreSQL) ← status: READY
```

---

## Tech Stack

### Core Technologies

| Tool                      | Role                                                        |
|---------------------------|-------------------------------------------------------------|
| **Python 3.12**           | Primary programming language                                |
| **FastAPI**               | HTTP REST API framework                                     |
| **FastStream + RabbitMQ** | Async message broker consumer (lesson events)               |
| **SQLAlchemy asyncio**    | Async ORM for PostgreSQL (conversations, lesson index)      |
| **asyncpg**               | PostgreSQL async driver                                     |
| **ChromaDB**              | Vector store for lesson chunk embeddings                    |
| **LangChain + OpenAI**    | Embedding generation and LLM answer synthesis               |
| **Dishka**                | Dependency injection with APP/REQUEST scope management      |
| **Bazario**               | In-process async event bus (notification handlers)          |
| **TaskIQ + AioPika**      | Background task queue (indexing, outbox relay)              |
| **Redis**                 | TaskIQ result backend, schedule source, application cache   |
| **Adaptix**               | Flexible data mapper (event serialization)                  |
| **Alembic**               | Database schema migrations                                  |
| **uvicorn + uvloop**      | ASGI server with high-performance event loop                |

### Architecture & Patterns

| Pattern / Concept      | Role                                                              |
|------------------------|-------------------------------------------------------------------|
| **Clean Architecture** | Strict layer separation: domain → application → infrastructure    |
| **DDD**                | Aggregates, value objects, domain events, domain services         |
| **CQRS**               | Commands and queries handled by separate interactors              |
| **Ports & Adapters**   | All infrastructure accessed through application-layer interfaces  |
| **Outbox Pattern**     | At-least-once event delivery via transactional outbox table       |
| **RAG**                | Vector-search-augmented LLM generation                            |
| **Repository Pattern** | SQLAlchemy and Chroma repositories behind port interfaces         |

### Code Quality

| Tool          | Role                                   |
|---------------|----------------------------------------|
| **Ruff**      | Code formatting and linting            |
| **mypy**      | Static type checking (strict)          |
| **bandit**    | Security vulnerability scanning        |
| **semgrep**   | Advanced static analysis               |
| **codespell** | Spell checking                         |
| **pytest**    | Testing framework (unit + integration) |
| **coverage**  | Code coverage analysis                 |

---

## Features

- **Question Answering**: Accepts a user question + `lesson_id`, retrieves relevant chunks via vector similarity, generates a grounded answer with the OpenAI LLM
- **Conversation Management**: Full conversation lifecycle — create, ask, get history, close
- **Lesson Indexing**: On `lesson.created` event — splits text into chunks, generates embeddings, stores them in ChromaDB; tracks index status (`PENDING → INDEXING → READY / FAILED`)
- **Lesson Reindexing**: On `lesson.updated` event — re-runs the indexing pipeline atomically
- **Outbox Relay**: Background task publishes domain events from the outbox table to RabbitMQ with at-least-once delivery guarantee
- **Task Scheduling**: TaskIQ manages indexing and outbox tasks with retry middleware and Redis-backed schedule source
- **User Registry**: Lightweight user projection within the bounded context (synced from auth service via events)
- **Context Window Service**: Selects relevant conversation history for LLM context within a configurable token budget
- **Text Splitter Service**: Smart lesson chunking with configurable size and overlap, respecting sentence boundaries

---

## HTTP API

All endpoints are prefixed with `/api/v1` (via `root_path="/api"`).

### Lesson Index

| Method | Path                            | Description                               |
|--------|---------------------------------|-------------------------------------------|
| `POST` | `/v1/lessons/{lesson_id}/index` | Schedule indexing for a new lesson        |
| `PUT`  | `/v1/lessons/{lesson_id}/index` | Schedule reindexing for an updated lesson |
| `GET`  | `/v1/lessons/{lesson_id}/index` | Get current index status for a lesson     |

### Conversations

| Method  | Path                                        | Description                       |
|---------|---------------------------------------------|-----------------------------------|
| `POST`  | `/v1/conversations/`                        | Start a new conversation          |
| `POST`  | `/v1/conversations/ask`                     | Ask a question (RAG + LLM answer) |
| `GET`   | `/v1/conversations/{conversation_id}`       | Get a conversation with messages  |
| `GET`   | `/v1/conversations/`                        | List conversations                |
| `PATCH` | `/v1/conversations/{conversation_id}/close` | Close a conversation              |

### Users

| Method   | Path                  | Description     |
|----------|-----------------------|-----------------|
| `POST`   | `/v1/users/`          | Register a user |
| `DELETE` | `/v1/users/{user_id}` | Remove a user   |
| `GET`    | `/v1/users/{user_id}` | Get user by ID  |
| `GET`    | `/v1/users/`          | List users      |

### Common

| Method | Path            | Description            |
|--------|-----------------|------------------------|
| `GET`  | `/healthcheck/` | Health check           |
| `GET`  | `/`             | Service info           |
| `GET`  | `/asyncapi`     | AsyncAPI documentation |

---

## RabbitMQ Subscribers

| Routing Key      | Trigger                | Action                             |
|------------------|------------------------|------------------------------------|
| `lesson.created` | New lesson published   | Schedule RAG indexing via TaskIQ   |
| `lesson.updated` | Lesson content updated | Schedule RAG reindexing via TaskIQ |

Messages are manually acknowledged — `nack` on failure to allow retry.

---

## Quick Start

### Prerequisites

- Python 3.12+
- [uv](https://docs.astral.sh/uv/) package manager
- Docker (for PostgreSQL, ChromaDB, RabbitMQ, Redis)
- OpenAI API key

### Setup

```sh
git clone https://github.com/morrs1/EducationPlatform
cd EducationPlatform/answer_service

# Install dependencies
uv sync --group dev
```

### Environment Variables

```env
# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=answer_service
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secret

# SQLAlchemy
SQLALCHEMY_POOL_SIZE=10
SQLALCHEMY_MAX_OVERFLOW=20
SQLALCHEMY_ECHO=false

# ChromaDB
CHROMA_HOST=localhost
CHROMA_PORT=8000

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# RabbitMQ
RABBIT_HOST=localhost
RABBIT_PORT=5672
RABBIT_USER=guest
RABBIT_PASSWORD=guest
RABBIT_VHOST=/

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_WORKER_DB=1
REDIS_SCHEDULE_SOURCE_DB=2
REDIS_CACHE_DB=0

# ASGI
ASGI_HOST=0.0.0.0
ASGI_PORT=8080
FASTAPI_DEBUG=false
```

### Running the Services

```sh
# HTTP server (FastAPI + embedded RabbitMQ consumer)
uvicorn answer_service.fastapi_app:create_fastapi_app --factory --host 0.0.0.0 --port 8080

# Standalone RabbitMQ consumer (FastStream)
faststream run answer_service.faststream_app:create_faststream_app

# Background task worker (TaskIQ)
taskiq worker answer_service.worker:create_worker_taskiq_app
```

### Database Migrations

```sh
# Apply migrations
uv run alembic upgrade head

# Create new migration
uv run alembic revision --autogenerate -m "description"
```

---

## Architecture

### Clean Architecture Layers

The project follows Clean Architecture with strict inward-only dependency flow:

```
Presentation → Application → Domain
                   ↑
             Infrastructure
```

#### Domain Layer

**Location:** `src/answer_service/domain/`

Pure business logic — no external dependencies, no frameworks.

| Aggregate / Entity | Description                                                                                         |
|--------------------|-----------------------------------------------------------------------------------------------------|
| `Conversation`     | Aggregate root. Holds a list of `Message` entities (question + answer + status)                     |
| `Message`          | Entity within `Conversation`. Contains `Question`, `Answer`, `MessageStatus`                        |
| `LessonIndex`      | Aggregate root (id = external `LessonId`). Tracks indexing state and holds `DocumentChunk` entities |
| `DocumentChunk`    | Entity within `LessonIndex`. Stores `ChunkContent`, `Embedding`, and position                       |
| `User`             | Thin aggregate root. Identity projection from the auth service                                      |

**Domain Services:**

| Service                | Responsibility                                                                    |
|------------------------|-----------------------------------------------------------------------------------|
| `TextSplitterService`  | Splits lesson text into `ChunkContent[]` with smart sentence-boundary chunking    |
| `ContextWindowService` | Selects messages from conversation history for the LLM context window             |

**Value Objects:** `ConversationId`, `MessageId`, `Question` (max 4096 chars), `Answer`, `TokenUsage`, `ModelName`, `LessonId`, `ChunkId`, `ChunkContent` (max 8192 chars), `Embedding` (immutable `tuple[float, ...]`), `IndexStatus`, `UserId`

**Domain Events:** `ConversationStarted`, `QuestionAsked`, `AnswerGenerated`, `AnswerGenerationFailed`, `ConversationClosed`, `LessonIndexingRequested`, `LessonIndexed`, `LessonIndexingFailed`, `LessonReindexRequested`, `UserRegistered`

#### Application Layer

**Location:** `src/answer_service/application/`

Orchestrates domain logic through commands and queries (CQRS). All infrastructure access goes through ports (interfaces).

**Commands:**

| Handler                               | Description                                                           |
|---------------------------------------|-----------------------------------------------------------------------|
| `AskQuestionCommandHandler`           | Core RAG pipeline: embed question → search chunks → generate answer   |
| `CreateConversationCommandHandler`    | Start a new conversation                                              |
| `CloseConversationCommandHandler`     | Mark conversation as closed                                           |
| `IndexLessonCommandHandler`           | Split → embed → store chunks in ChromaDB; update `LessonIndex` status |
| `ReindexLessonCommandHandler`         | Re-run indexing for updated lesson content                            |
| `ScheduleIndexLessonCommandHandler`   | Enqueue indexing task in TaskIQ                                       |
| `ScheduleReindexLessonCommandHandler` | Enqueue reindexing task in TaskIQ                                     |
| `RelayOutboxCommandHandler`           | Publish pending outbox messages to RabbitMQ                           |
| `CreateUserCommandHandler`            | Register user in local projection                                     |
| `DeleteUserCommandHandler`            | Remove user from local projection                                     |

**Queries:**

| Handler                            | Description                                    |
|------------------------------------|------------------------------------------------|
| `GetConversationQueryHandler`      | Fetch single conversation with message history |
| `GetConversationsQueryHandler`     | List conversations                             |
| `GetLessonIndexStatusQueryHandler` | Get current indexing status for a lesson       |
| `GetUserByIdQueryHandler`          | Fetch user by ID                               |
| `GetUsersQueryHandler`             | List users                                     |

**Ports** (interfaces in `application/common/ports/`):
`ConversationRepository`, `LessonIndexRepository`, `UserRepository`, `OutboxRepository`, `OutboxPublisher`, `TransactionManager`, `EmbeddingPort`, `VectorSearchPort`, `LLMPort`, `EventBus`, `EventSerializer`, `TaskScheduler`

#### Infrastructure Layer

**Location:** `src/answer_service/infrastructure/`

Concrete adapters behind application ports.

| Adapter                            | Port                     | Technology               |
|------------------------------------|--------------------------|--------------------------|
| `SqlAlchemyConversationRepository` | `ConversationRepository` | PostgreSQL + SQLAlchemy  |
| `SqlAlchemyLessonIndexRepository`  | `LessonIndexRepository`  | PostgreSQL + SQLAlchemy  |
| `SqlAlchemyUserRepository`         | `UserRepository`         | PostgreSQL + SQLAlchemy  |
| `SqlAlchemyOutboxRepository`       | `OutboxRepository`       | PostgreSQL + SQLAlchemy  |
| `SqlAlchemyTransactionManager`     | `TransactionManager`     | SQLAlchemy async session |
| `ChromaVectorSearchPort`           | `VectorSearchPort`       | ChromaDB (LangChain)     |
| `LangChainEmbeddingPort`           | `EmbeddingPort`          | OpenAI Embeddings        |
| `LangChainOpenAILLMPort`           | `LLMPort`                | ChatOpenAI (LangChain)   |
| `FastStreamOutboxPublisher`        | `OutboxPublisher`        | FastStream + RabbitMQ    |
| `BazarioEventBus`                  | `EventBus`               | Bazario in-process bus   |
| `RedisCacheStore`                  | `CacheStore`             | Redis asyncio            |
| `TaskIQTaskScheduler`              | `TaskScheduler`          | TaskIQ + AioPika         |
| `RetortEventSerializer`            | `EventSerializer`        | Adaptix                  |

#### Presentation Layer

**Location:** `src/answer_service/presentation/`

**HTTP** (`presentation/http/v1/`): FastAPI routers with Dishka-injected interactors. Each operation lives in its own directory (`ask_question/`, `index_lesson/`, etc.) with `handlers.py` and `schemas.py`.

**RabbitMQ** (`presentation/rabbitmq/v1/`): FastStream subscribers for `lesson.created` and `lesson.updated` with manual ack/nack.

### Dependency Injection

**Dishka** manages the IoC container with two scopes:

| Provider                | Scope   | Contents                                                          |
|-------------------------|---------|-------------------------------------------------------------------|
| `configs_provider`      | APP     | Config objects from context (`PostgresConfig`, `RedisConfig`, …)  |
| `db_provider`           | APP/REQ | SQLAlchemy engine (APP), sessionmaker (APP), `AsyncSession` (REQ) |
| `cache_provider`        | REQUEST | `Redis` client (lifecycle via async generator + `ConnectionPool`) |
| `vector_store_provider` | APP     | Chroma client, embeddings, `ChatOpenAI`                           |
| `bazario_provider`      | APP/REQ | `Registry` (APP), `DishkaResolver` (REQ), `Dispatcher` (REQ)      |
| `mappers_provider`      | APP     | LLM and vector search mappers, event serializer                   |
| `domain_ports_provider` | REQUEST | ID generators, factories, `EventsCollection`, domain services     |
| `gateways_provider`     | REQUEST | All repositories, adapters, `BazarioEventBus`                     |
| `interactors_provider`  | REQUEST | All command and query handlers                                    |
| `scheduler_provider`    | APP/REQ | `ScheduleSource` (APP), `TaskIQTaskScheduler` (REQ)               |

**Key design:** `EventsCollection` is REQUEST-scoped and shared across all aggregates within a request — events are published atomically at the end of the use case.

### Event Flow

```
Command handler
    │
    ▼
Aggregate.method()  →  pushes to EventsCollection
    │
    ▼
event_bus.publish(events_collection.pull())
    │
    ├──→ OutboxRepository.add(serialized_event)   [within transaction]
    │
    └──→ Bazario Publisher.publish(event)          [background asyncio.Task]
               │
               ▼
          Notification handlers (in-process)

[separately, via TaskIQ]
RelayOutboxCommandHandler
    │
    └──→ OutboxPublisher → RabbitMQ
```

---

## Development

### Code Quality Tools

```sh
# Format + lint (ruff format → ruff check → codespell)
just lint

# Type checking
just mypy

# Security analysis
just bandit

# Full static analysis (CI-level)
just static-analysis   # mypy + bandit + semgrep

# Run all pre-commit hooks
just pre-commit-all
```

### Running Tests

```sh
# All tests
pytest -v

# With coverage
pytest --cov=src/answer_service --cov-report=html

# Unit tests only
pytest tests/unit -v

# Integration tests only
pytest tests/integration -v
```

### Git Hooks

```sh
# Install pre-commit hooks
just pre-commit-install
```

Pre-commit hooks run Ruff, mypy, bandit, and codespell before each commit.

---

## Project Structure

```
src/answer_service/
├── domain/
│   ├── common/              # Base classes: Entity, Aggregate, ValueObject, Event
│   ├── user/                # User aggregate (identity from auth service)
│   ├── conversation/        # Conversation + Message aggregates
│   │   ├── entities/
│   │   ├── value_objects/
│   │   ├── factories/
│   │   ├── ports/
│   │   ├── services/
│   │   └── events.py
│   └── lesson_index/        # LessonIndex + DocumentChunk aggregates
│       ├── entities/
│       ├── value_objects/
│       ├── factories/
│       ├── ports/
│       ├── services/
│       └── events.py
│
├── application/
│   ├── commands/
│   │   ├── conversation/    # ask_question, create, close
│   │   ├── lesson_index/    # index, reindex, schedule_index, schedule_reindex
│   │   ├── outbox/          # relay_outbox
│   │   └── user/            # create_user, delete_user
│   ├── queries/
│   │   ├── conversation/    # get_conversation, get_conversations
│   │   ├── lesson_index/    # get_lesson_index_status
│   │   └── user/            # get_user_by_id, get_users
│   └── common/
│       ├── ports/           # Interfaces for all infrastructure adapters
│       └── views/           # DTOs for query responses
│
├── infrastructure/
│   ├── adapters/
│   │   ├── common/          # UUID generators, BazarioEventBus
│   │   ├── langchain/       # Embedding and LLM adapters
│   │   ├── messaging/       # FastStream outbox publisher
│   │   └── persistence/     # SQLAlchemy repositories, ChromaVectorSearchPort
│   ├── cache/               # CacheStore protocol, RedisCacheStore, provider
│   ├── mappers/             # Adaptix event serializer, LLM/vector mappers
│   ├── persistence/
│   │   ├── models/          # SQLAlchemy ORM models + imperative mapping
│   │   ├── provider.py      # Engine + session factory
│   │   ├── chroma_provider.py
│   │   └── migrations/      # Alembic migrations
│   └── scheduler/
│       ├── tasks/           # TaskIQ task definitions (outbox, lesson_index)
│       └── task_iq_scheduler.py
│
├── presentation/
│   ├── http/v1/
│   │   ├── common/          # Healthcheck, index route, exception handler
│   │   ├── middlewares/     # LoggingMiddleware
│   │   └── routes/
│   │       ├── conversation/ # ask_question, create, get, get_all, close
│   │       ├── lesson_index/ # index, reindex, get_status
│   │       └── user/         # create, delete, get, get_all
│   └── rabbitmq/v1/
│       └── lesson_index/    # lesson.created, lesson.updated subscribers
│
├── setup/
│   ├── configs/             # Pydantic settings (Postgres, Redis, OpenAI, …)
│   ├── ioc.py               # Dishka providers
│   └── bootstrap.py         # App factories (broker, routes, task manager)
│
├── fastapi_app.py           # FastAPI entry point (HTTP + RabbitMQ consumer)
├── faststream_app.py        # FastStream entry point (standalone consumer)
└── worker.py                # TaskIQ worker entry point
```

---

## Versioning

Versioning is managed automatically by [Hatch VCS](https://hatch.pypa.io/latest/version/) from git tags.

```sh
# Current version
python -c "from answer_service._version import __version__; print(__version__)"
```

> [!NOTE]
> If the version is stale, delete `src/answer_service/_version.py` and reinstall: `uv sync`
