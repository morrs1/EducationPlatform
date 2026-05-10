<h2 align="center">User Service</h2>

*The identity microservice for the Education Platform — owns user registration, password verification, profile data, role assignment, and profile photo storage.*

Built as a Spring Boot service on top of Clean Architecture and DDD principles.

---

## Overview

`user_service` is the source of truth for user identity in the EducationPlatform monorepo. It exposes a small HTTP API for:

- registering a new user
- verifying credentials (email + password) on behalf of the API gateway
- reading user data by id
- updating profile fields (first name, surname, patronymic, status)
- assigning the `AUTHOR` or `ADMIN` role
- uploading a profile photo to an S3-compatible store (SeaweedFS)

The service does **not** issue JWTs and does **not** run Spring Security HTTP filters. It uses `spring-security-crypto` only for BCrypt password hashing. The `api_gateway` calls `POST /user/auth/login`, receives the canonical user record on success, and converts it into a JWT for clients.

Sibling services (`answer_service`, `course_service`, `learning_service`, `frontend`) reference users by UUID and maintain thin local projections.

### Request flow

```
HTTP client
   |
   v
api_gateway (issues JWT)
   |
   v
user_service /user/...
   |
   +--> CreateHandler / UserAuthHandler / ReadByIdHandler / UpdateUserHandler /
   |    AssignUserRoleHandler / AddProfilePhotoHandler
   |
   v
Application interactor (transactional)
   |
   +--> UserDomainService (records domain events)
   +--> UserRepo  -----> PostgreSQL
   +--> PhotoStorage --> SeaweedFS (S3)
   +--> EventBus  -----> Spring ApplicationEventPublisher
```

---

## Tech Stack

### Core Technologies

| Tool                          | Role                                                       |
|-------------------------------|------------------------------------------------------------|
| **Java 25**                   | Primary programming language                               |
| **Spring Boot 4.0.3**         | Application framework                                      |
| **Gradle (Kotlin DSL)**       | Build system, configured in `build.gradle.kts`             |
| **Spring WebMVC**             | HTTP REST API                                              |
| **Spring Data JPA + JDBC**    | Persistence                                                |
| **PostgreSQL**                | Relational store for users                                 |
| **Liquibase**                 | Database schema migrations under `deploy/liquibase/`       |
| **spring-security-crypto**    | BCrypt password hashing only (no Spring Security HTTP)     |
| **AWS SDK for Java (S3) 2.x** | S3 client used against SeaweedFS                           |
| **Springdoc OpenAPI**         | OpenAPI 3 generation + Swagger UI                          |
| **MapStruct 1.6.3**           | Compile-time DTO / domain / JPA mapping                    |
| **Lombok**                    | Boilerplate reduction (constructors, getters, setters)     |
| **JUnit 5**                   | Testing                                                    |

### Architecture & Patterns

| Pattern / Concept      | Role                                                              |
|------------------------|-------------------------------------------------------------------|
| **Clean Architecture** | `presentation -> application -> domain`, infrastructure inverts   |
| **DDD**                | `User` aggregate, value objects, domain events, domain service    |
| **Ports & Adapters**   | All infrastructure accessed through application-layer interfaces  |
| **CQRS-light**         | Each use case is its own interactor with a command or query input |

---

## HTTP API

All routes are mounted under the root context. The `api_gateway` routes external traffic to this service via `/api/user/...` and additionally forwards `/auth/login` / `/auth/register` to `/user/auth/...`.

OpenAPI / Swagger:

| Path               | Description     |
|--------------------|-----------------|
| `/swagger-ui.html` | Swagger UI      |
| `/v3/api-docs`     | OpenAPI 3 JSON  |

### Auth

Implemented in `UserAuthHandler` (`/user/auth`). Returns the canonical user record on success — no JWT is issued here.

| Method | Path                  | Description                                         |
|--------|-----------------------|-----------------------------------------------------|
| `POST` | `/user/auth/register` | Register a new user (same body as `POST /user`)     |
| `POST` | `/user/auth/login`    | Verify credentials, return user id / email / role   |

### User CRUD

Implemented in `CreateHandler` and `ReadByIdHandler` (`/user`).

| Method | Path     | Description                                |
|--------|----------|--------------------------------------------|
| `POST` | `/user`  | Create a user, returns the new UUID        |
| `GET`  | `/user`  | Read a user by id (`?id=<uuid>` query arg) |

### Profile updates

Implemented in `UpdateUserHandler` (`/user/{id}/...`). Each field has its own endpoint and a tiny request record.

| Method  | Path                          | Description                |
|---------|-------------------------------|----------------------------|
| `PATCH` | `/user/{id}/change_name`      | Update first name          |
| `PATCH` | `/user/{id}/change_surname`   | Update surname             |
| `PATCH` | `/user/{id}/change_patronymic`| Update patronymic          |
| `PATCH` | `/user/{id}/change_status`    | Update free-form status    |

### Role management

Implemented in `AssignUserRoleHandler`. Roles are `USER` (default), `AUTHOR`, `ADMIN`.

| Method  | Path                         | Description                |
|---------|------------------------------|----------------------------|
| `PATCH` | `/user/{id}/assign_author`   | Promote user to `AUTHOR`   |
| `PATCH` | `/user/{id}/assign_admin`    | Promote user to `ADMIN`    |

### Profile photo

Implemented in `AddProfilePhotoHandler`. Active only when the SeaweedFS adapter bean is present (`temp.s3.enabled=true`). Multipart upload, max 10MB, allowed extensions `jpg`, `jpeg`, `png`, `webp`.

| Method | Path               | Description                                              |
|--------|--------------------|----------------------------------------------------------|
| `POST` | `/user/add_photo`  | Multipart upload (`user_id` query param + `file` part)   |

Successful upload returns the bucket, S3 key, public URL, original filename, content type, and size.

---

## Domain Model

### `User` aggregate

`org.example.user_service.domain.user.User` extends `BaseEntity` (id is a `UUID`). Fields:

| Field              | Type                   | Notes                                          |
|--------------------|------------------------|------------------------------------------------|
| `id`               | `UUID`                 | inherited from `BaseEntity`                    |
| `surname`          | `UserSurname`          |                                                |
| `name`             | `UserName`             |                                                |
| `patronymic`       | `UserPatronymic`       |                                                |
| `userStatus`       | `UserStatus`           | free-form profile status string                |
| `email`            | `UserEmail`            | unique lookup key                              |
| `password`         | `UserPassword`         | BCrypt hash (never logged: `@ToString` excludes it) |
| `profilePhotoLink` | `UserProfilePhotoLink` | URL into the SeaweedFS bucket                  |
| `role`             | `UserRole`             | one of `USER`, `AUTHOR`, `ADMIN`               |

State transitions go through `UserDomainService` (constructor-injected `PasswordHasher` for `add(...)`). The service records `BaseDomainEvent`s (e.g. `CreateUserDomainEvent`) which are flushed via `EventBus.publish(...)` at the end of each interactor.

### Value objects

Located in `domain/user/vo/`. All extend `BaseValueObject` and validate themselves in their constructors:

`UserId`, `UserEmail`, `UserName`, `UserSurname`, `UserPatronymic`, `UserStatus`, `UserPassword`, `UserProfilePhotoLink`, `UserRole`.

`UserRole` exposes constants `DEFAULT = "USER"`, `AUTHOR`, `ADMIN`. Unknown roles raise `ValidateException` from `domain/base/exceptions/`.

### Application ports

Defined in `application/ports/`:

| Port                 | Adapter                              | Purpose                                |
|----------------------|--------------------------------------|----------------------------------------|
| `UserRepo`           | `HibernateUserRepo`                  | Add / read by id / read by email / update |
| `PhotoStorage`       | `SeaweedFSUserProfilePhotoRepo`      | Upload bytes to the S3 bucket           |
| `EventBus`           | `SpringEventBus`                     | Publish domain events in-process        |
| `TransactionManager` | `SpringTransactionManagerAdapter`    | Wrap interactor logic in a transaction  |

`PasswordHasher` is the only port owned by the **domain** layer (under `domain/user/ports/`); its adapter `PasswordHasherBcrypt` lives under `infrastructure/adapters/password_hasher/`.

### Application errors

`UserNotFoundException`, `UserAlreadyExistsException`, `InvalidCredentialsException` — translated to HTTP status codes by `ApiExceptionHandler` in `presentation/http/v1/exceptionHandlers/`.

---

## Configuration / Environment Variables

Configuration is loaded from `src/main/resources/application.yaml` and overridden by an optional `.env[.properties]` file at the service root (`spring.config.import: optional:file:.env[.properties]`). See `.env.example`.

### PostgreSQL

| Variable                  | Default            | Description                          |
|---------------------------|--------------------|--------------------------------------|
| `POSTGRES_HOST`           | `localhost`        | Database host                        |
| `POSTGRES_EXTERNAL_PORT`  | `5435`             | Mapped Postgres port                 |
| `POSTGRES_DB`             | `user_service_db`  | Database name                        |
| `POSTGRES_USER`           | `morrs`            | Database user                        |
| `POSTGRES_PASSWORD`       | `123`              | Database password                    |

### S3 / SeaweedFS (`temp.s3.*`)

| Variable                     | Default        | Description                                        |
|------------------------------|----------------|----------------------------------------------------|
| `TEMP_S3_ENABLED`            | `false`        | Master switch for the S3 adapter and `/user/add_photo` |
| `TEMP_S3_REGION`             | `eu-central-1` | AWS region passed to the SDK                       |
| `TEMP_S3_BUCKET`             | (empty)        | Target bucket name                                 |
| `TEMP_S3_ENDPOINT`           | (empty)        | SeaweedFS S3 endpoint URL                          |
| `TEMP_S3_ACCESS_KEY`         | (empty)        | S3 access key                                      |
| `TEMP_S3_SECRET_KEY`         | (empty)        | S3 secret key                                      |
| `TEMP_S3_PUBLIC_BASE_URL`    | (empty)        | Public base URL used to form `profilePhotoLink`    |
| `TEMP_S3_PATH_STYLE_ACCESS`  | `false`        | Use path-style URLs (required for SeaweedFS)       |

### Web / multipart

- HTTP port: `8080` (`server.port`).
- Multipart limits: `spring.servlet.multipart.max-file-size=10MB`, `max-request-size=10MB`.

### Local SeaweedFS example values (from `.env.example`)

```
TEMP_S3_ENABLED=true
TEMP_S3_BUCKET=user-service-local
TEMP_S3_REGION=us-east-1
TEMP_S3_ACCESS_KEY=seaweedfs-admin
TEMP_S3_SECRET_KEY=seaweedfs-admin-secret
TEMP_S3_ENDPOINT=http://localhost:8333
TEMP_S3_PATH_STYLE_ACCESS=true
TEMP_S3_PUBLIC_BASE_URL=http://localhost:8333/user-service-local
```

---

## Quick Start

### Prerequisites

- JDK 25
- Docker (for local PostgreSQL and SeaweedFS via the compose files in `deploy/`)
- The bundled Gradle wrapper — no global Gradle install needed

### Bring up local infrastructure

```sh
docker compose -f deploy/postgres/docker_compose_user_service.yaml up -d
docker compose -f deploy/s3/docker_compose_s3_seaweedfs_user_service.yaml up -d
# optional, only if your environment uses Redis:
docker compose -f deploy/redis/docker_compose_redis.yaml up -d
```

Liquibase changelogs in `deploy/liquibase/changelog/` describe the schema. The runtime applies them via the Spring Boot Liquibase integration on startup (or run them out-of-band against the same database).

### Configure environment

```sh
cp .env.example .env
# edit .env to match your local Postgres / SeaweedFS
```

### Build and run

```sh
./gradlew bootRun          # run the service on http://localhost:8080
./gradlew build            # compile + run all tests
./gradlew test             # JUnit 5 tests only
```

Once running:

- Swagger UI: <http://localhost:8080/swagger-ui.html>
- OpenAPI JSON: <http://localhost:8080/v3/api-docs>

---

## Project Structure

```
user_service/
  build.gradle.kts            Gradle Kotlin DSL build
  settings.gradle.kts
  gradlew, gradlew.bat        Gradle wrapper
  .env.example                Sample environment configuration
  deploy/
    liquibase/changelog/      v.1.0.0/init.sql + later migration folders
    postgres/                 docker-compose for the user_service Postgres
    redis/                    docker-compose for local Redis
    s3/                       docker-compose for SeaweedFS (S3-compatible)
  docs/
    course-service-db-schema.md      reference schema for course_service
    learning-service-db-schema.md    reference schema for learning_service
  src/main/java/org/example/user_service/
    UserServiceApplication.java
    domain/                   pure business logic (no Spring, no JPA)
      base/                   BaseEntity, BaseValueObject, BaseDomainEvent,
                              BaseDomainService, exceptions/
      user/                   User aggregate, events/, ports/, services/, vo/
    application/              orchestration layer
      exceptions/             UserNotFoundException, UserAlreadyExistsException,
                              InvalidCredentialsException
      ports/                  UserRepo, PhotoStorage, EventBus, TransactionManager
      interactors/
        mappers/UserViewMapper
        user/<operation>/     create_user, authenticate_user, read_user_by_id,
                              update_user, assign_role, add_profile_photo
    infrastructure/           adapters behind application + domain ports
      adapters/persistence/   HibernateUserRepo (JPA UserRepo adapter)
      adapters/password_hasher/ PasswordHasherBcrypt (BCrypt PasswordHasher)
      adapters/s3/            SeaweedFSUserProfilePhotoRepo (PhotoStorage)
      adapters/event_bus/     SpringEventBus
      adapters/transactions/  SpringTransactionManagerAdapter
      event_handlers/         UserEventHandler (@EventListener for domain events)
      persistence/models/     HibernateUser (JPA entity, table `users`)
      persistence/mappers/    UserMapperHibernate (MapStruct domain <-> JPA)
    presentation/http/v1/
      user/create/{dto,handlers}/
      user/auth/{dto,handlers}/
      user/read_by_id/{dto,handlers}/
      user/update_user/{dto,...}/
      user/assign_role/
      user/add_profile_photo/
      mappers/                UserMapperCommand, UserMapperQuery (MapStruct)
      exceptionHandlers/      ApiExceptionHandler, ErrorResponse
      exception/              EmptyFileException
    setup/config_beans/
      user/                   UserBeansConfig (interactor wiring)
      s3/                     SeaweedFSBeansConfig, SeaweedFSConnectionInfo
      transaction/            TransactionalBeansConfig
      openapi/                OpenApiConfig
  src/main/resources/
    application.yaml          datasource, multipart, springdoc, temp.s3.* config
  src/test/java/...           JUnit 5 tests
    application/interactors/user/{create_user, assign_role, authenticate_user}/
```

> [!NOTE]
> The two files in `docs/` (`course-service-db-schema.md`, `learning-service-db-schema.md`) are reference schemas for sibling services kept here for convenience. They are not consumed by `user_service` itself.
