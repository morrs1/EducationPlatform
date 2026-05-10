<h2 align="center">Course Service</h2>

*Spring Boot microservice that owns the course catalog for the Education Platform — courses, modules, lessons, typed lesson content, lesson assets (S3), and tags.*

Built following Clean Architecture / Domain-Driven Design.

---

## Overview

The Course Service is the source of truth for course content. It exposes a REST API for authoring and reading courses, lessons, and lesson assets. It does NOT track user progress — that responsibility lives in `learning_service`.

Lesson content updates are published as domain events through a transactional outbox to RabbitMQ. The downstream `answer_service` consumes these events to (re)index lessons for RAG.

### High-level data flow

```
HTTP client  →  api_gateway  →  POST /course/lesson/{id} (PATCH)
                                    │
                                    ▼
                       UploadLessonContentInteractor
                                    │
                       ┌────────────┴────────────┐
                       ▼                         ▼
                 LessonRepo (JPA)           EventBus → OutboxRepo
                                                 │       (same tx)
                                                 ▼
                                       OutboxSpringScheduler
                                                 │
                                                 ▼
                                            RabbitMQ
                                                 │
                                                 ▼
                                          answer_service
                                       (lesson reindex)
```

Lesson assets (images, videos, files) are uploaded via multipart, persisted to S3 (SeaweedFS-compatible), and referenced by URL from the lesson aggregate.

---

## Tech Stack

### Core Technologies

| Tool                        | Role                                                       |
|-----------------------------|------------------------------------------------------------|
| **Java 25**                 | Primary language (Gradle toolchain)                        |
| **Spring Boot 4.0.5**       | Application framework                                      |
| **Spring Data JPA**         | ORM access to PostgreSQL                                   |
| **Spring JDBC**             | Direct JDBC support for complex reads                      |
| **Spring WebMVC**           | HTTP layer (REST controllers, multipart)                   |
| **Spring AMQP**             | RabbitMQ publisher for outbox relay                        |
| **PostgreSQL**              | Primary relational store                                   |
| **Liquibase**               | Schema migrations (`deploy/liquibase/`)                    |
| **AWS SDK S3 v2**           | Lesson asset storage (S3 / SeaweedFS)                      |
| **MapStruct 1.6.3**         | DTO and entity mappers                                     |
| **Lombok**                  | Boilerplate reduction                                      |
| **Jackson**                 | JSON (de)serialization, lesson payload mapping             |
| **Springdoc OpenAPI 3.0.3** | Swagger UI and OpenAPI schema generation                   |
| **Gradle Kotlin DSL**       | Build system                                               |

### Architecture and Patterns

| Pattern / Concept      | Role                                                              |
|------------------------|-------------------------------------------------------------------|
| **Clean Architecture** | Strict layer separation: domain -> application -> infrastructure |
| **DDD**                | Aggregates, value objects, domain services, domain events         |
| **Use Case Interactors** | One folder per use case under `application/interactors/`        |
| **Ports and Adapters** | All infrastructure accessed through application-layer interfaces  |
| **Outbox Pattern**     | At-least-once event delivery via transactional outbox table       |
| **Repository Pattern** | JPA repositories behind `*Repo` port interfaces                   |

---

## HTTP API

All endpoints are mounted under the base path `/course`. When reached through `api_gateway` they are prefixed with `/api`, e.g. `/api/course/...`.

OpenAPI / Swagger UI is exposed by Springdoc at `/swagger-ui.html` and `/v3/api-docs`.

### Courses

| Method  | Path                                       | Description                                                |
|---------|--------------------------------------------|------------------------------------------------------------|
| `POST`  | `/course`                                  | Create a course with metadata and optional tag references  |
| `GET`   | `/course/{id}`                             | Get course by id with module and lesson preview structure  |
| `GET`   | `/course`                                  | List all courses                                           |
| `GET`   | `/course/search?q=...`                     | Full-text search published courses by title (fts_vector)   |
| `GET`   | `/course/by-author/{authorId}/published`   | List published courses for an author (`is_preview = true`) |
| `GET`   | `/course/by-author/{authorId}/drafts`      | List draft courses for an author                           |
| `PATCH` | `/course/{id}/publish`                     | Publish a course (sets `is_preview = true`); returns 204   |

### Modules

| Method | Path                      | Description                          |
|--------|---------------------------|--------------------------------------|
| `POST` | `/course/{id}/module`     | Create a module inside the course    |

### Lessons

| Method  | Path                       | Description                                                          |
|---------|----------------------------|----------------------------------------------------------------------|
| `POST`  | `/course/lesson`           | Create a lesson and attach its preview to the target module          |
| `GET`   | `/course/lesson/{id}`      | Get lesson by id (metadata, typed content, attached assets)          |
| `PATCH` | `/course/lesson/{id}`      | Upload / replace lesson content (`theory`, `quiz`, or `coding` JSON) |

### Assets

| Method | Path                              | Description                                                           |
|--------|-----------------------------------|-----------------------------------------------------------------------|
| `POST` | `/course/lesson/{id}/asset`       | Upload a lesson asset (multipart: `file` + JSON `request`), max 200MB |

Allowed asset extensions:

| Asset type        | Extensions                                |
|-------------------|-------------------------------------------|
| `image` / `cover` | `jpg`, `jpeg`, `png`, `webp`              |
| `video`           | `mp4`, `webm`, `mov`, `avi`, `mkv`        |
| `file`            | `pdf`, `txt`, `doc`, `docx`, `zip`, `rar` |

---

## Domain Model

The bounded context is split into aggregates under `domain/`. All entities extend `BaseEntity`, value objects extend `BaseValueObject`, domain services extend `BaseDomainService`, and domain events extend `BaseDomainEvent`.

| Aggregate / Entity | Description                                                                                       |
|--------------------|---------------------------------------------------------------------------------------------------|
| `Course`           | Aggregate root. Title, description, language, difficulty, estimated minutes, author, tags, modules |
| `Module`           | Entity within `Course`. Title, description, position, holds `LessonPreview`s                       |
| `LessonPreview`    | Lightweight projection of a lesson inside a module (title, type, position, isPreview)              |
| `Lesson`           | Aggregate root. Title, `LessonType` (`theory` / `quiz` / `coding`), typed `LessonPayload`          |
| `Asset`            | Aggregate root. Storage key, public URL, mime type, size, original filename, type                  |
| `Tag`              | Reusable course tag                                                                                |
| `OutboxMessage`    | Persistent outbox row for the transactional outbox relay                                           |

**Typed lesson payloads** (under `domain/lesson/payload/`):

| Type                  | Payload                                                            |
|-----------------------|--------------------------------------------------------------------|
| `TheoryLessonPayload` | `markdown`                                                         |
| `QuizLessonPayload`   | `introMarkdown`, list of `QuizQuestion` with `QuizOption`s         |
| `CodingLessonPayload` | `taskMarkdown`, `checkerType`, `CodingLanguageTemplate`s, `CodingTestCase`s |

**Domain events** (under `domain/lesson/events/`):

- `UploadLessonContentEvent` — emitted when lesson content is uploaded / updated; relayed via outbox to RabbitMQ routing key `lesson.created` and consumed by `answer_service`.

---

## Configuration / Environment Variables

The service loads `application.yaml` and optionally a local `.env` (via `spring.config.import`). All variables have safe defaults except those marked as required.

### PostgreSQL

| Variable                  | Default            | Description                |
|---------------------------|--------------------|----------------------------|
| `POSTGRES_HOST`           | `localhost`        | PostgreSQL host            |
| `POSTGRES_EXTERNAL_PORT`  | `5435`             | PostgreSQL port            |
| `POSTGRES_DB`             | `course_service`   | Database name              |
| `POSTGRES_USER`           | `morrs`            | Database user              |
| `POSTGRES_PASSWORD`       | `123`              | Database password          |

### RabbitMQ

| Variable                | Default    | Description                          |
|-------------------------|------------|--------------------------------------|
| `RABBITMQ_HOST`         | (required) | RabbitMQ host                        |
| `RABBITMQ_PORT`         | (required) | RabbitMQ AMQP port                   |
| `RABBITMQ_DEFAULT_USER` | (required) | Used as both username and password   |

### S3 / SeaweedFS (lesson assets)

| Variable                    | Default        | Description                                                |
|-----------------------------|----------------|------------------------------------------------------------|
| `TEMP_S3_ENABLED`           | `false`        | Feature flag for S3-backed assets                          |
| `TEMP_S3_REGION`            | `eu-central-1` | AWS region                                                 |
| `TEMP_S3_BUCKET`            | (empty)        | Target bucket                                              |
| `TEMP_S3_ENDPOINT`          | (empty)        | Custom endpoint (SeaweedFS / MinIO). Empty means real AWS  |
| `TEMP_S3_ACCESS_KEY`        | (empty)        | Access key (fallback: default credentials provider chain)  |
| `TEMP_S3_SECRET_KEY`        | (empty)        | Secret key                                                 |
| `TEMP_S3_PUBLIC_BASE_URL`   | (empty)        | Public URL prefix for stored objects                       |
| `TEMP_S3_PATH_STYLE_ACCESS` | `false`        | Use path-style URLs (typical for SeaweedFS/MinIO)          |

### HTTP

| Setting                     | Value   |
|-----------------------------|---------|
| `server.port`               | `8081`  |
| `spring.servlet.multipart.max-file-size`    | `200MB` |
| `spring.servlet.multipart.max-request-size` | `200MB` |

---

## Quick Start

### Prerequisites

- JDK 25 (or let the Gradle toolchain provision it)
- Docker (for PostgreSQL, RabbitMQ, optionally SeaweedFS)
- Liquibase changelogs are bundled under `deploy/liquibase/`

### Run

```sh
# from course_service/
./gradlew bootRun
```

### Build

```sh
./gradlew build
```

### Test

```sh
./gradlew test
```

The service binds to `:8081`. Swagger UI: <http://localhost:8081/swagger-ui.html>.

---

## Project Structure

```
course_service/
├── build.gradle.kts
├── settings.gradle.kts
├── deploy/
│   ├── liquibase/
│   │   └── changelog/
│   │       ├── db.changelog-master.yaml
│   │       ├── v.1.0.0/init.sql
│   │       └── v.1.0.1/test-seed.sql
│   └── postgres/docker_compose_course_service.yaml
└── src/main/
    ├── java/com/example/course_service/
    │   ├── CourseServiceApplication.java
    │   │
    │   ├── domain/                       # Pure business logic, no framework deps
    │   │   ├── base/                     # BaseEntity, BaseValueObject,
    │   │   │   │                         # BaseDomainEvent, BaseDomainService
    │   │   │   └── exceptions/
    │   │   ├── course/                   # Course aggregate + vo/ + services/
    │   │   ├── module/                   # Module entity + vo/
    │   │   ├── lesson_preview/           # LessonPreview entity + vo/
    │   │   ├── lesson/                   # Lesson aggregate
    │   │   │   ├── vo/
    │   │   │   ├── payload/              # Theory / Quiz / Coding payload types
    │   │   │   ├── events/               # Lesson domain events
    │   │   │   └── services/             # LessonDomainService
    │   │   ├── asset/                    # Asset aggregate + vo/ + services/
    │   │   ├── tag/
    │   │   └── outbox_message/
    │   │
    │   ├── application/                  # Use cases and ports
    │   │   ├── interactors/
    │   │   │   ├── course/<operation>/   # add_course, add_module_to_course,
    │   │   │   │                         # publish_course, read_all,
    │   │   │   │                         # read_course_by_id, read_courses_by_author,
    │   │   │   │                         # search_courses
    │   │   │   ├── lesson/<operation>/   # add_lesson, read_lesson_by_id,
    │   │   │   │                         # upload_content
    │   │   │   ├── asset/<operation>/    # add_asset_to_lesson
    │   │   │   └── mappers/              # CourseViewMapper, LessonViewMapper
    │   │   ├── ports/                    # CourseRepo, LessonRepo, AssetRepo,
    │   │   │                             # AssetFileStorage, OutboxRepo, EventBus,
    │   │   │                             # TransactionManager, LessonPayloadMapper
    │   │   └── exceptions/               # CourseNotFoundException,
    │   │                                 # LessonNotFoundException,
    │   │                                 # ModuleNotFoundException,
    │   │                                 # TagNotFoundException,
    │   │                                 # InvalidLessonContentException
    │   │
    │   ├── infrasructure/                # NOTE: directory name has a typo;
    │   │   │                             # do not rename without a coordinated migration
    │   │   ├── adapters/
    │   │   │   ├── persistence/          # Hibernate*Repo (CourseRepo, LessonRepo,
    │   │   │   │                         # AssetRepo, OutboxRepo) implementations
    │   │   │   ├── file_storage/         # SeaweedFSLessonAssetRepo (S3 client)
    │   │   │   ├── event_bus/            # SpringEventBus
    │   │   │   ├── event_handlers/       # LessonEventsHandler + outbox payload DTOs
    │   │   │   └── transactions/         # SpringTransactionManagerAdapter
    │   │   ├── persistence/
    │   │   │   ├── models/               # JPA entities (Hibernate*)
    │   │   │   ├── mappers/              # JPA <-> domain mappers
    │   │   │   └── repositories/         # Spring Data JPA repositories
    │   │   └── schedulers/
    │   │       └── OutboxSpringScheduler # @Scheduled fixedRate=5000ms outbox relay
    │   │
    │   ├── presentation/
    │   │   └── http/v1/
    │   │       ├── handlers/             # REST controllers, one folder per operation
    │   │       │   ├── course/<operation>/
    │   │       │   ├── lesson/<operation>/
    │   │       │   └── asset/<operation>/
    │   │       ├── mappers/              # MapStruct request<->command, view<->response
    │   │       ├── exceptions/           # Presentation-only exceptions
    │   │       └── exceptions_handlers/  # @RestControllerAdvice + ErrorResponse
    │   │
    │   └── setup/
    │       ├── SpringConfig.java         # @EnableScheduling
    │       └── config_beans/
    │           ├── course/               # Course interactor beans
    │           ├── lesson/               # Lesson interactor beans
    │           ├── asset/                # Asset interactor beans
    │           ├── s3/                   # S3Client + connection info
    │           ├── brokers/rabbitMQ/     # RabbitMQ listener container
    │           ├── serialization/        # Jackson config
    │           └── transations/          # NOTE: typo preserved; transaction manager beans
    │
    └── resources/
        └── application.yaml
```

---

## Related Services

- `api_gateway` — Spring Cloud Gateway in front of all backend services; exposes `course_service` under `/api/course/...`.
- `answer_service` — Python RAG service; consumes `lesson.created` / `lesson.updated` events emitted by this service.
- `learning_service` — owns user progress over courses (separate bounded context).
- `user_service` — identity and authors.
- `frontend` — React 19 + Vite UI.
