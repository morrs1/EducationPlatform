---
applyTo: "answer_service/**/*.py"
---

# Python / FastAPI (`answer_service`) — Copilot Instructions

Apply to every Python file in `answer_service/`. Read alongside `answer_service/AGENTS.md` and `answer_service/CLAUDE.md`.

## Architecture

- Clean Architecture / DDD: `domain → application ← infrastructure → presentation`. Same layering as the Java services.
- `src/answer_service/domain/` — aggregates, entities, value objects, domain events, domain services. No FastAPI / SQLAlchemy / LangChain / Dishka imports.
- `src/answer_service/application/` — CQRS interactors (`commands/<domain>/<operation>.py`, `queries/<domain>/<operation>.py`), ports in `common/ports/`, views in `common/views/`.
- `src/answer_service/infrastructure/` — SQLAlchemy repos, ChromaDB adapter, LangChain adapters (embedding + LLM), FastStream publisher, TaskIQ scheduler.
- `src/answer_service/presentation/http/v1/routes/<domain>/<operation>/` — one folder per endpoint with `handlers.py` (router named `<operation>_router` using `DishkaRoute`) and `schemas.py` (Pydantic models).
- `src/answer_service/presentation/rabbitmq/v1/` — FastStream subscribers with manual ack / nack.
- `src/answer_service/setup/` — Pydantic configs (`configs/`), Dishka providers (`ioc.py`), app factories (`bootstrap.py`).

## DDD Building Blocks

- All entities and aggregates inherit from `BaseEntity` / `BaseAggregateRoot`. Value objects inherit from `ValueObject` (`domain/common/value_object.py`).
- Value objects override only `_validate()` and `__str__()`. Never override `__post_init__`.
- Aggregates do **not** own their `EventsCollection`; it is injected via factories from Dishka (REQUEST scope). One `EventsCollection` per HTTP / RabbitMQ request.
- Domain event flow: aggregate method → `EventsCollection.push` → interactor calls `event_bus.publish(events_collection.pull())` → outbox row written in the same transaction → `RelayOutboxCommandHandler` (TaskIQ background task) publishes to RabbitMQ.

## Code Style

- Python 3.12. Fully type-annotated everywhere. Avoid `typing.Any`.
- `# type: ignore` is allowed only with an inline reason comment.
- Dataclasses for commands / queries / views, with `frozen=True, slots=True, kw_only=True`.
- Interactor signatures:
  ```python
  @final
  class CreateXxxCommandHandler:
      def __init__(self, ...ports...) -> None: ...
      async def __call__(self, data: CreateXxxCommand) -> CreateXxxView: ...
  ```
- Map application views to Pydantic responses **explicitly** in `presentation/`. Do not call `model_validate` on dataclasses.

## Testing

- `pytest`, structure under `tests/{unit,integration,e2e}` mirrors `src/`.
- Arrange / Act / Assert with explicit comments. No other comments in tests.
- Name tests by behavior + expected outcome.
- Unit tests are the default. Integration tests only when behavior spans layers.
- Keep tests deterministic, fast, isolated from network and IO.

## Validation

```sh
just lint            # ruff format + ruff check + codespell — minimum after edit
just mypy
just bandit
just static-analysis # mypy + bandit + semgrep — before commit
pytest -v            # if tests exist for the area you touched
```

Fix every Ruff and mypy error before moving on. Do not leave type errors unresolved.

## Migrations

```sh
uv run alembic upgrade head
uv run alembic revision --autogenerate -m "<description>"
```
