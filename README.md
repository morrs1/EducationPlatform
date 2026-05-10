# EducationPlatform

A polyglot microservice education platform monorepo.

## Services

| Directory          | Stack                              | Role                                                                          | Local port |
|--------------------|------------------------------------|-------------------------------------------------------------------------------|------------|
| `api_gateway/`     | Java 25, Spring Boot 4             | Single public entry point: auth, authorization, reverse proxy to downstreams  | 8090       |
| `user_service/`    | Java 25, Spring Boot 4, PostgreSQL | User identity, authentication, profile data, roles, profile photo (S3)        | 8080       |
| `course_service/`  | Java 25, Spring Boot 4, PostgreSQL, RabbitMQ, S3 | Courses, modules, lessons, lesson content, lesson assets        | 8081       |
| `learning_service/`| Java 25, Spring Boot 4, PostgreSQL | Enrollments, lesson completions, certificates, study activity                 | 8082       |
| `answer_service/`  | Python 3.12, FastAPI, ChromaDB, OpenAI, RabbitMQ | RAG: answers user questions grounded in lesson content          | 8080 (separate process) |
| `frontend/`        | React 19, Vite, Redux Toolkit, Tailwind 4 | Web client (FSD architecture)                                          | 5173       |

Each service is independently built and run. See per-service `README.md` for tech stack, HTTP API, configuration, and quick-start commands.

## Architecture at a glance

- **API Gateway** is the public surface. It authenticates via `user_service`, issues a JWT, and proxies `/api/{user,course,learning}/**` to the matching service. Authorization rules (role + course ownership) are enforced at the gateway.
- **Inter-service messaging** uses RabbitMQ with the **transactional outbox** pattern: services write events to an outbox table in the same DB transaction, a relay publishes them to RabbitMQ.
- **`course_service`** is the producer of lesson lifecycle events. **`answer_service`** consumes them to index lesson content into ChromaDB for RAG.
- **`user_service`** is the source of truth for user identity. Other services keep thin user projections referenced by UUID — there is no shared schema.
- All Java services follow Clean Architecture / DDD: `domain → application ← infrastructure → presentation`.

## Repository conventions

- Per-directory `AGENTS.md` files describe rules for AI coding agents (architecture boundaries, where to put new code, validation commands). The root `AGENTS.md` covers the monorepo as a whole.
- No root `package.json`. The repo root is not a workspace.
- No shared build system. Each Java service has its own `./gradlew`. `answer_service` uses `uv` + `just`. `frontend` uses `npm`.
- Inter-service contracts are kept at the UUID + event level, never via shared code.

## Working locally

Pick a service and run its quick-start. Examples:

```sh
# Frontend
cd frontend && npm install && npm run dev

# Any Java service (example: user_service)
cd user_service && ./gradlew bootRun

# Answer service
cd answer_service && uv sync --group dev && uvicorn answer_service.fastapi_app:create_fastapi_app --factory --host 0.0.0.0 --port 8080
```

Each service ships its own `docker-compose` or `deploy/` folder for required infrastructure (Postgres, RabbitMQ, ChromaDB, Redis, S3).

## Layout

```
EducationPlatformAll/
├── AGENTS.md
├── README.md
├── api_gateway/
├── user_service/
├── course_service/
├── learning_service/
├── answer_service/
└── frontend/
```
