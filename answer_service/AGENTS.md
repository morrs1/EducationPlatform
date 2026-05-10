# AGENTS.md

## Scope

This file applies to everything under `answer_service/`.

For full architectural details and operational rules see `answer_service/CLAUDE.md` and `answer_service/README.md`. This file is the short orientation; both linked files take precedence on the topics they cover.

## Project Snapshot

`answer_service` is a Python 3.12 RAG microservice for the Education Platform. It answers user questions grounded in lesson content by combining vector search over ChromaDB with an LLM call (OpenAI via LangChain).

Stack:

- FastAPI (HTTP), FastStream + RabbitMQ (events), TaskIQ (background tasks)
- SQLAlchemy asyncio + asyncpg + PostgreSQL (conversations, lesson index, outbox)
- ChromaDB (vector store), LangChain + OpenAI (embeddings + chat)
- Dishka (DI, APP/REQUEST scopes), Bazario (in-process event bus), Adaptix
- Alembic (migrations), `uv` (package manager), `just` (task runner)

Three runnable entry points:

- `answer_service.fastapi_app:create_fastapi_app` — HTTP server + embedded broker consumer
- `answer_service.faststream_app:create_faststream_app` — standalone RabbitMQ consumer
- `answer_service.worker:create_worker_taskiq_app` — TaskIQ worker (indexing + outbox relay)

## Architecture Rules

Clean Architecture with strict inward-only dependency flow: `presentation → application → domain` and `infrastructure → application`.

- `domain/` — aggregates, entities, value objects, domain events, domain services. No framework imports here.
- `application/` — CQRS interactors. `commands/<domain>/<operation>.py`, `queries/<domain>/<operation>.py`. All infra access goes through ports in `application/common/ports/`.
- `infrastructure/` — concrete adapters for the application ports (SQLAlchemy repos, Chroma adapter, LangChain adapters, FastStream publisher, etc.).
- `presentation/http/v1/routes/<domain>/<operation>/` — one folder per HTTP operation, with `handlers.py` (router named `<operation>_router`, using `DishkaRoute`) and `schemas.py`.
- `presentation/rabbitmq/v1/` — FastStream subscribers, manual ack/nack.
- `setup/` — Pydantic configs, Dishka providers (`ioc.py`), app factories (`bootstrap.py`).

Domain rules:

- All entities/aggregates inherit `BaseEntity` / `BaseAggregateRoot`. All value objects inherit `ValueObject` (from `domain/common/value_object.py`) and override only `_validate()` and `__str__()`. Never override `__post_init__`.
- Aggregates do not own their `EventsCollection` — it is injected through factories (Dishka, REQUEST scope). One `EventsCollection` per request; events are published atomically at the end of the use case.
- `Embedding.vector` is `tuple[float, ...]` (immutable).
- Domain events flow: aggregate method pushes to `EventsCollection` → handler calls `event_bus.publish(events_collection.pull())` → outbox row written in the same transaction → background `RelayOutboxCommandHandler` publishes to RabbitMQ.

## Coding Standards

- Python 3.12, fully type-annotated, avoid `typing.Any`.
- `# type: ignore` requires an inline reason.
- Ruff for format + lint, mypy strict, bandit + semgrep for security, codespell for typos, pytest for tests.

## Validation

Run from `answer_service/`:

```sh
just lint            # ruff format + ruff check + codespell
just mypy
just bandit
just static-analysis # mypy + bandit + semgrep (CI level, run before commit)
pytest -v
```

Expectations:

- Any code change: `just lint` is the minimum bar.
- Before any commit: `just static-analysis`.
- If tests exist for the touched area: `pytest -v` must pass.
- Fix all ruff and mypy errors before moving on. Never leave type errors unresolved.

## Database Migrations

```sh
uv run alembic upgrade head
uv run alembic revision --autogenerate -m "<description>"
```

## Practical Editing Rules

- Run `git status --short` before editing — there may be in-progress refactors.
- Do not edit generated files (`_version.py`, `.venv/`, `dist/`).
- Tests mirror `src/` structure under `tests/unit/`, `tests/integration/`, `tests/e2e/`. Use Arrange / Act / Assert. Do not add comments in tests other than parametrization case descriptions.
- Keep interactor handler signatures consistent: `__init__` receives ports + services via Dishka; `__call__(self, data: <Command|Query>) -> <View>`.
- Map application views to Pydantic responses explicitly in the presentation layer — do not call `model_validate` on dataclasses.

## Good Defaults for Agents

- Read `CLAUDE.md` before making structural changes. The domain model and ValueObject contract there are authoritative.
- Prefer extending an existing operation folder over collapsing operations into shared handlers.
- Keep Russian copy in user-visible messages where it already exists.
- When adding a new infrastructure dependency, add a port in `application/common/ports/` first, then the adapter in `infrastructure/`.
