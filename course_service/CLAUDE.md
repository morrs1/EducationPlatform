# CLAUDE.md — course_service

This file targets Claude Code and any AI assistant compatible with `CLAUDE.md` discovery. It is the per-service entry point. The repo-wide `CLAUDE.md`, `AGENTS.md`, and the per-tool config files (`.cursor/rules/*.mdc`, `.windsurfrules`) all encode the same intent for different tools — keep them aligned.

## Project Intent

`course_service` is the source of truth for the course catalog: courses, modules, lessons, typed lesson content, lesson assets, and tags. It owns lesson content end-to-end and produces `lesson.*` events through a transactional outbox to RabbitMQ so downstream services (notably `answer_service`) can react. Lesson assets live on S3 (SeaweedFS-compatible). This service does NOT track user progress — that responsibility belongs to `learning_service`.

## Read First

Before editing anything in this service, read these in order:

1. `course_service/AGENTS.md` — authoritative layer rules and folder conventions for this service.
2. `course_service/README.md` — architecture overview, data flow, HTTP API tables, env vars.
3. Repo root `CLAUDE.md` — non-negotiable cross-service rules and validation bar.
4. Repo root `.cursor/rules/clean-architecture.mdc`, `.cursor/rules/ddd.mdc`, `.cursor/rules/tdd.mdc` — cross-cutting principles every Java service follows.

## Stack Snapshot

| Item             | Value                                                          |
|------------------|----------------------------------------------------------------|
| Language         | Java 25 (Gradle toolchain)                                     |
| Framework        | Spring Boot 4.0.5 (WebMVC, Data JPA, JDBC, AMQP)               |
| Build            | Gradle Kotlin DSL                                              |
| DB               | PostgreSQL + Liquibase (`deploy/liquibase/`)                   |
| Messaging        | RabbitMQ — publisher only, fed by transactional outbox         |
| File storage     | AWS SDK S3 v2 (SeaweedFS-compatible)                           |
| Mapping          | MapStruct 1.6.3, Lombok                                        |
| Java root pkg    | `com.example.course_service`                                   |
| HTTP port        | `8081` (gateway-prefixed as `/api/course/...`)                 |
| Multipart cap    | 200MB (Spring config)                                          |

## Architecture Map

Strict Clean Architecture / DDD. Dependencies point inward.

```
presentation -> application -> domain
                    ^
              infrastructure
```

| Package (under `com.example.course_service`)                | Responsibility                                                                 |
|-------------------------------------------------------------|--------------------------------------------------------------------------------|
| `domain/base/`                                              | `BaseEntity`, `BaseValueObject`, `BaseDomainEvent`, `BaseDomainService`         |
| `domain/course/`, `domain/module/`, `domain/lesson_preview/`| Course aggregate subtree                                                       |
| `domain/lesson/`                                            | Lesson aggregate; `vo/`, `payload/`, `events/`, `services/`                    |
| `domain/asset/`, `domain/tag/`, `domain/outbox_message/`    | Other aggregates                                                               |
| `application/interactors/<aggregate>/<operation>/`          | One folder per use case (e.g. `course/publish_course/PublishCourseInteractor`) |
| `application/interactors/mappers/`                          | Read-side view shaping (`CourseViewMapper`, `LessonViewMapper`)                |
| `application/ports/`                                        | Port interfaces — `CourseRepo`, `LessonRepo`, `AssetRepo`, `AssetFileStorage`, `OutboxRepo`, `EventBus`, `TransactionManager`, `LessonPayloadMapper` |
| `application/exceptions/`                                   | Domain/application exceptions thrown from interactors                          |
| `infrasructure/adapters/`                                   | Port implementations — persistence, file_storage, event_bus, event_handlers, transactions |
| `infrasructure/persistence/`                                | JPA models, Spring Data repos, JPA <-> domain mappers                          |
| `infrasructure/schedulers/`                                 | `OutboxSpringScheduler` — relays outbox to RabbitMQ at `fixedRate=5000`        |
| `presentation/http/v1/handlers/<aggregate>/<operation>/`    | One `@RestController` per operation, plus `dto/{request,response}/`            |
| `presentation/http/v1/mappers/`                             | MapStruct DTO <-> command / view <-> response                                  |
| `presentation/http/v1/exceptions_handlers/`                 | `@RestControllerAdvice` mapping app exceptions to HTTP                         |
| `setup/config_beans/{course,lesson,asset,brokers/rabbitMQ,s3,serialization,transations}/` | `@Configuration` classes — wire interactors and adapters as beans |

### Intentional typo paths — do not silently rename

Two paths in the source tree contain known typos that the rest of the codebase imports against. Both are deliberate at this point in time. Treat them as canonical names:

| Typo path                           | Correct English | Rule                                                                       |
|-------------------------------------|-----------------|----------------------------------------------------------------------------|
| `infrasructure/`                    | `infrastructure`| Do NOT rename. Many imports depend on this exact spelling.                  |
| `setup/config_beans/transations/`   | `transactions`  | Do NOT rename. Wired into Spring config under this exact spelling.          |

A rename of either path must be its own dedicated, isolated change — never a drive-by edit.

## Hard Rules

1. **Course publishing is a state transition on the `Course` aggregate.** Publishing happens through the `publish_course` interactor (`PublishCourseInteractor.publish(UUID)` wrapped in `TransactionManager.inTransaction`). Never inline status changes in a controller, and never write `is_preview = true` from a handler or a Spring Data repo call from outside the interactor.
2. **Lesson assets go through the `AssetFileStorage` port.** Use cases call the port; the AWS S3 SDK is imported only inside the adapter (`infrasructure/adapters/file_storage/SeaweedFSLessonAssetRepo`). Reuse the `S3Client` and `SeaweedFSConnectionInfo` exposed by `setup/config_beans/s3/SeaweedFSBeansConfig`. Do not construct a new `S3Client` elsewhere.
3. **Every state change another service cares about goes through the outbox.** Lesson lifecycle events (`lesson.created`, `lesson.updated`, `lesson.published`, etc.) must be written as an `OutboxMessage` row in the SAME DB transaction as the aggregate change. The `OutboxSpringScheduler` reads unprocessed rows every 5 seconds and publishes to RabbitMQ. Never call `rabbitTemplate.send(...)` from a domain method or an interactor.
4. **Multipart upload limit is 200MB** (`spring.servlet.multipart.max-file-size` and `max-request-size`). If a feature legitimately needs more, change the config in `application.yaml` — do not stream-around the limit in code.
5. **`domain/lesson/payload/` is the structured representation of lesson content** (theory markdown, quiz with options, coding tasks with templates and test cases). Use the `LessonPayloadMapper` port to convert between domain payloads and JSON. The Jackson implementation lives in `infrasructure/persistence/mappers/JacksonLessonPayloadMapper`. Do not import Jackson from the domain or application layers.
6. **Wrap writes in `TransactionManager.inTransaction(...)`.** Inside the same transaction, persist aggregate changes and call `eventBus.publish(domainService.pullEvents())` so events land in the outbox atomically.
7. **One folder per use case.** Add new operations under `application/interactors/<aggregate>/<operation>/` and a matching `presentation/http/v1/handlers/<aggregate>/<operation>/` — do not append methods to an existing handler.
8. **HTTP base path is `/course`.** Courses and modules sit at `/course`, lessons at `/course/lesson`, assets at `/course/lesson/{id}/asset`. The gateway adds `/api`. Do not change the base path.

## Anti-patterns (do not do)

- Spring, JPA, or Jackson annotations on classes under `domain/`.
- Calling Spring Data JPA repositories from a handler or directly from `setup/`.
- Raising domain events without writing them to the outbox in the same transaction.
- Calling `rabbitTemplate.send(...)` from anywhere other than the outbox relay scheduler.
- Constructing a fresh `S3Client` instead of reusing the one from `setup/config_beans/s3/`.
- Renaming `infrasructure/` to `infrastructure/` or `transations/` to `transactions/` as part of an unrelated change.
- Passing domain types across the HTTP boundary in request/response DTOs.
- Throwing `IllegalArgumentException` from domain code instead of `ValidateException` (or a more specific subclass).

## Existing Test Pattern

A meaningful unit test example lives at `src/test/java/com/example/course_service/infrasructure/persistence/mappers/LessonHibernateMapperTest.java`. New JPA <-> domain mapper changes should follow the same pattern (pure JUnit, no Spring context).

## Validation

Run from `course_service/`.

```sh
./gradlew build       # compile + run tests + annotation processors (MapStruct)
./gradlew check       # all verification tasks
./gradlew test        # tests only
./gradlew bootRun     # run the service on :8081
```

Validation expectations by change type:

| Change                                    | Minimum                  |
|-------------------------------------------|--------------------------|
| Domain or application logic               | `./gradlew test`         |
| New endpoint, DTO, or MapStruct mapper    | `./gradlew build`        |
| Liquibase changelog                       | `./gradlew bootRun` against local Postgres from `deploy/postgres/docker_compose_course_service.yaml` |
| Anything before commit                    | `./gradlew check`        |

There is no Checkstyle / Spotless / Sonar enforcement on this build — do not claim coverage you have not added.
