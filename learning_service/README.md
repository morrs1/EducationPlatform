<h2 align="center">Learning Service</h2>

*Spring Boot microservice for the Education Platform that tracks user learning progress: course enrollments, lesson completions, daily study activity, and earned certificates.*

Built around Clean Architecture and Domain-Driven Design (DDD): a pure domain model, use-case interactors behind ports, and Spring/JPA confined to the infrastructure and presentation layers.

---

## Overview

`learning_service` owns the "what has this user done with which course" view of the platform. It does not store course content (that belongs to `course_service`) and it does not own user identity (that belongs to `user_service`). It only references `userId`, `courseId`, and `lessonId` as opaque UUIDs and exposes its own HTTP API, reached from clients through `api_gateway` at `/api/learning/...`.

Three bounded contexts live side by side inside the service:

- **Enrollment** — a user signing up for a course, completing individual lessons, completing or leaving the course.
- **Certificate** — a record issued for a completed enrollment (with a placeholder URL until S3 is wired up).
- **Study activity** — a calendar-like daily counter of lessons completed by a user, used for activity heatmaps.

---

## Tech Stack

```
+----------------------+--------------------------------------------+
| Tool                 | Role                                       |
+----------------------+--------------------------------------------+
| Java 25              | Language toolchain                         |
| Spring Boot 4.0.6    | Application framework                      |
| Spring Web MVC       | HTTP REST endpoints                        |
| Spring Data JPA      | Persistence access                         |
| Hibernate            | JPA provider (UTC time zone)               |
| PostgreSQL driver    | Production datasource                      |
| Liquibase            | Versioned SQL migrations                   |
| Springdoc OpenAPI    | Swagger UI / OpenAPI 3 docs (3.0.3)        |
| Lombok               | Boilerplate reduction                      |
| H2                   | In-memory test datasource (PostgreSQL mode)|
| JUnit 5              | Test framework                             |
| Gradle (Groovy DSL)  | Build (build.gradle, not kts)              |
+----------------------+--------------------------------------------+
```

Architecture and patterns:

```
+----------------------+--------------------------------------------+
| Pattern              | Role                                       |
+----------------------+--------------------------------------------+
| Clean Architecture   | domain -> application -> infrastructure    |
| DDD                  | Aggregates, value objects, domain services |
| Ports & Adapters     | application/ports + infrastructure/adapters|
| Use-case interactors | One folder per use case under interactors/ |
| Repository pattern   | *RepoJpaAdapter behind *Repo port          |
+----------------------+--------------------------------------------+
```

---

## Domain Model

### Enrollment (aggregate root: `Enrollment`)

- Tracks the relationship between a user and a course.
- Holds the list of `LessonCompletion` entities for that user-course pair.
- Status is the `EnrollmentStatus` value object — currently `IN_PROGRESS` or `COMPLETED`.
- Domain rules live in `domain/enrollment/services/EnrollmentDomainService` (e.g. completing a course, completing a lesson, ensuring statuses are consistent).
- Application exceptions: `EnrollmentNotFoundException`, `EnrollmentAlreadyExistsException`.

### Certificate (aggregate root: `Certificate`)

- Issued exactly once per completed enrollment.
- Carries an issued-at timestamp, a serial number, and a file URL. The URL is currently produced by `application/certificate/CertificateStubS3Url` — a placeholder until real S3 storage is integrated.
- Domain rules live in `domain/certificate/services/CertificateDomainService`.
- Application exceptions: `CertificateNotFoundException`, `CertificateAlreadyExistsForEnrollmentException`.

### StudyActivity (aggregate root: `UserStudyDay`)

- One row per `(userId, calendar day)` with a counter of lessons completed that day.
- Updated transactionally from the enrollment use cases (`complete_lesson` increments, `leave_course` decrements according to that enrollment's completed lessons).
- Domain rules live in `domain/activity/services/StudyActivityDomainService`.
- Read use case `read_activity_year` returns only the days that actually have activity for the given calendar year.

---

## HTTP API

All paths are served by `learning_service` directly on port `8082` and surfaced through `api_gateway` at `/api/learning/...`.

OpenAPI tags: `Learning enrollment`, `Learning certificate`, `Learning activity`.

### Enrollment (`/learning/enrollment`)

```
+--------+--------------------------------+--------------------------------------------------+
| Method | Path                           | Description                                      |
+--------+--------------------------------+--------------------------------------------------+
| POST   | /                              | Enroll user in course (creates IN_PROGRESS)      |
| POST   | /complete-lesson               | Mark a lesson as completed; bumps daily activity |
| POST   | /complete-course               | Mark course as COMPLETED                         |
| POST   | /leave                         | Leave course; removes enrollment, certificate,   |
|        |                                | and decrements activity counters                 |
| GET    | /completed-lessons             | Completed lessons by ?userId&courseId            |
| GET    | /courses/by-user/completed     | Completed courses by ?userId                     |
| GET    | /courses/by-user/incomplete    | In-progress courses by ?userId                   |
+--------+--------------------------------+--------------------------------------------------+
```

### Certificate (`/learning/certificate`)

```
+--------+-------------------------+--------------------------------------------------------+
| Method | Path                    | Description                                            |
+--------+-------------------------+--------------------------------------------------------+
| POST   | /                       | Create certificate for a completed enrollment          |
| GET    | /{certificateId}        | Get certificate by id                                  |
| GET    | /by-user/{userId}       | List user's certificates, newest issued-at first       |
+--------+-------------------------+--------------------------------------------------------+
```

### Activity (`/learning/activity`)

```
+--------+--------+----------------------------------------------------------------+
| Method | Path   | Description                                                    |
+--------+--------+----------------------------------------------------------------+
| GET    | /year  | Daily activity by ?userId&year (only days with activity)       |
+--------+--------+----------------------------------------------------------------+
```

API documentation:

- Swagger UI: `http://localhost:8082/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8082/v3/api-docs`

Errors are mapped to JSON `ErrorResponse` payloads by `presentation/http/v1/exception_handlers/ApiExceptionHandler`.

---

## Configuration

Production configuration lives in `src/main/resources/application.yaml`. Tests override it via `src/test/resources/application-test.yaml`.

```
+--------------------------+--------------------------------------------------------+
| Key                      | Default                                                |
+--------------------------+--------------------------------------------------------+
| server.port              | 8082                                                   |
| spring.datasource.url    | jdbc:postgresql://localhost:5437/learning_service_db   |
| spring.datasource.user   | ${POSTGRES_USER:postgres}                              |
| spring.datasource.pass   | ${POSTGRES_PASSWORD:postgres}                          |
| spring.jpa.ddl-auto      | validate                                               |
| spring.jpa.open-in-view  | false                                                  |
| hibernate.jdbc.time_zone | UTC                                                    |
| springdoc.api-docs.path  | /v3/api-docs                                           |
| springdoc.swagger-ui.path| /swagger-ui.html                                       |
+--------------------------+--------------------------------------------------------+
```

Environment variables:

```
+-------------------+-----------+----------------------------------------+
| Variable          | Default   | Notes                                  |
+-------------------+-----------+----------------------------------------+
| POSTGRES_USER     | postgres  | Override in .env for non-dev setups    |
| POSTGRES_PASSWORD | postgres  | Override in .env for non-dev setups    |
+-------------------+-----------+----------------------------------------+
```

`application.yaml` imports `optional:file:.env[.properties]`, so a local `.env` next to the service is the supported way to override datasource credentials. The database host/port (`localhost:5437`) is currently hardcoded in `application.yaml` — adjust there if your local PostgreSQL is exposed elsewhere.

Schema is managed by Liquibase under `deploy/liquibase/` (`db.changelog-master.yaml` plus versioned changelogs). Hibernate runs in `validate` mode in production, so any new column or table must come from a Liquibase changeset, not from JPA auto-DDL.

The test profile uses H2 in PostgreSQL compatibility mode with `ddl-auto: create-drop`, so unit / slice tests do not need a running PostgreSQL.

---

## Quick Start

### Prerequisites

- JDK 25 (Gradle's toolchain will fetch one if missing)
- PostgreSQL 14+ available at `localhost:5437` with database `learning_service_db` (or override via `.env` / `application.yaml`)
- Liquibase changelog applied (see `deploy/liquibase/`)

### Run

```sh
# Run the service (Spring Boot)
./gradlew bootRun

# Build a fat JAR and run the test suite
./gradlew build

# Run only tests (uses H2)
./gradlew test
```

The service listens on `http://localhost:8082`. Through the gateway it is available at `http://<gateway-host>/api/learning/...`.

---

## Project Structure

```
learning_service/
├── build.gradle
├── settings.gradle
├── deploy/
│   ├── liquibase/
│   │   └── changelog/
│   │       ├── db.changelog-master.yaml
│   │       └── v.1.0.0/
│   └── postgres/
└── src/
    ├── main/
    │   ├── java/org/example/learning_service/
    │   │   ├── LearningServiceApplication.java
    │   │   ├── domain/
    │   │   │   ├── base/                    # BaseEntity, BaseValueObject,
    │   │   │   │                            # BaseDomainService, ValidateException
    │   │   │   ├── enrollment/              # Enrollment, LessonCompletion,
    │   │   │   │   ├── vo/                  #   EnrollmentStatus
    │   │   │   │   └── services/            #   EnrollmentDomainService
    │   │   │   ├── certificate/             # Certificate
    │   │   │   │   └── services/            #   CertificateDomainService
    │   │   │   └── activity/                # UserStudyDay
    │   │   │       └── services/            #   StudyActivityDomainService
    │   │   ├── application/
    │   │   │   ├── ports/                   # EnrollmentRepo, CertificateRepo,
    │   │   │   │                            # StudyActivityRepo, TransactionManager
    │   │   │   ├── exceptions/              # use-case-level exceptions
    │   │   │   ├── certificate/             # CertificateStubS3Url (stub)
    │   │   │   └── interactors/
    │   │   │       ├── enrollment/
    │   │   │       │   ├── enroll_user_in_course/
    │   │   │       │   ├── complete_lesson/
    │   │   │       │   ├── complete_course/
    │   │   │       │   ├── leave_course/
    │   │   │       │   ├── read_completed_lessons_for_course/
    │   │   │       │   └── user_course_lists/
    │   │   │       ├── certificate/
    │   │   │       │   ├── create_certificate/
    │   │   │       │   ├── get_certificate/
    │   │   │       │   └── list_certificates_by_user/
    │   │   │       ├── activity/
    │   │   │       │   └── read_activity_year/
    │   │   │       └── mappers/             # domain/view mappers used by interactors
    │   │   ├── infrastructure/
    │   │   │   ├── adapters/
    │   │   │   │   ├── persistence/         # *RepoJpaAdapter implements *Repo ports
    │   │   │   │   └── transactions/        # SpringTransactionManagerAdapter
    │   │   │   └── persistence/
    │   │   │       ├── repositories/        # *SpringDataRepo (Spring Data JPA)
    │   │   │       ├── mappers/             # *PersistenceMapper (domain <-> JPA)
    │   │   │       └── models/              # Hibernate* JPA entities per aggregate
    │   │   ├── presentation/http/v1/
    │   │   │   ├── enrollment/<operation>/  # dto/ + handlers/
    │   │   │   ├── certificate/<operation>/ # dto/ + handlers/
    │   │   │   ├── activity/<operation>/    # dto/ + handlers/
    │   │   │   ├── exception_handlers/      # ApiExceptionHandler, ErrorResponse
    │   │   │   └── mappers/                 # *MapperQuery (view -> response DTO)
    │   │   └── setup/config_beans/
    │   │       ├── enrollment/              # EnrollmentBeansConfig
    │   │       ├── certificate/             # CertificateBeansConfig
    │   │       ├── activity/                # StudyActivityBeansConfig
    │   │       └── transaction/             # TransactionalBeansConfig
    │   └── resources/
    │       └── application.yaml
    └── test/
        ├── java/org/example/learning_service/
        └── resources/
            └── application-test.yaml
```

---

## Notes

- Certificate file storage (S3) is **not** implemented. `application/certificate/CertificateStubS3Url` returns a stub URL so the `Certificate` aggregate can be exercised end-to-end. Replace it deliberately when an object storage adapter is introduced.
- The service is intentionally decoupled from `course_service` and `user_service`: there is no shared schema and no synchronous lookup back to those services. Sibling services pass `userId`, `courseId`, and `lessonId` as UUIDs and `learning_service` treats them as opaque identifiers.
