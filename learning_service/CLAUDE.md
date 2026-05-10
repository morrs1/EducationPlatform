# CLAUDE.md — learning_service

`learning_service` is the Spring Boot microservice that records what users
have done with which courses: course enrollments, lesson completions, daily
study activity, and earned certificates. It consumes user IDs and course IDs
as opaque UUIDs from `user_service` and `course_service` — there is no shared
schema, no synchronous lookup back, and no domain entity from a sibling
service is reused here. The service is built around Clean Architecture and
DDD: a pure domain model, use-case interactors behind ports, and Spring +
JPA confined to infrastructure and presentation.

## Read first

Before editing anything in `learning_service/`, read in this order:

1. `learning_service/AGENTS.md` — layer boundaries, naming, validation bar.
2. `learning_service/README.md` — domain model, HTTP API, configuration.
3. Repo root `CLAUDE.md` — non-negotiable monorepo rules.
4. `.cursor/rules/clean-architecture.mdc`, `.cursor/rules/ddd.mdc`,
   `.cursor/rules/tdd.mdc` — cross-cutting principles.

The same intent is encoded in `.cursor/rules/service.mdc` and
`.windsurfrules` next to this file. If you change a rule here, mirror it
there.

## Architecture map

Three bounded contexts live side by side under
`org.example.learning_service`:

```
+--------------+----------------------------+----------------------+--------------------------------------------+
| Context      | Aggregate(s)               | Port                 | Handlers (presentation/http/v1/...)        |
+--------------+----------------------------+----------------------+--------------------------------------------+
| enrollment   | Enrollment (root)          | EnrollmentRepo       | enroll/, complete_lesson/,                 |
|              | + LessonCompletion entity  |                      | complete_course/, leave_course/,           |
|              | + EnrollmentStatus vo      |                      | read_completed_lessons/,                   |
|              |                            |                      | user_course_lists/                         |
| certificate  | Certificate (root)         | CertificateRepo      | certificate/handlers/{Create,Get,List...}  |
| activity     | UserStudyDay (root)        | StudyActivityRepo    | activity/handlers/                         |
|              | + UserStudyDayId           |                      | ReadStudyActivityYearHandler               |
+--------------+----------------------------+----------------------+--------------------------------------------+
```

One-line role per context:

- `enrollment` — owns the user-course relationship, lesson progress, and
  status transitions (`IN_PROGRESS` -> `COMPLETED`).
- `certificate` — issues exactly one record per completed enrollment, with
  a stub URL until S3 is wired up.
- `activity` — daily counter of lessons completed by a user, used to render
  the activity heatmap for a calendar year.

The fourth port is cross-cutting:

- `TransactionManager` (`application/ports/TransactionManager`) is the
  transactional boundary used by every interactor; the Spring adapter is
  `infrastructure/adapters/transactions/SpringTransactionManagerAdapter`.

## HTTP routes

```
+--------+-----------------------------------------+----------------------------------------+
| Method | Path                                    | Handler aggregate / operation          |
+--------+-----------------------------------------+----------------------------------------+
| POST   | /learning/enrollment                    | enrollment / enroll                    |
| POST   | /learning/enrollment/complete-lesson    | enrollment / complete_lesson           |
| POST   | /learning/enrollment/complete-course    | enrollment / complete_course           |
| POST   | /learning/enrollment/leave              | enrollment / leave_course              |
| GET    | /learning/enrollment/completed-lessons  | enrollment / read_completed_lessons    |
| GET    | /learning/enrollment/courses/by-user/completed   | enrollment / user_course_lists|
| GET    | /learning/enrollment/courses/by-user/incomplete  | enrollment / user_course_lists|
| POST   | /learning/certificate                   | certificate / create_certificate       |
| GET    | /learning/certificate/{certificateId}   | certificate / get_certificate          |
| GET    | /learning/certificate/by-user/{userId}  | certificate / list_certificates_by_user|
| GET    | /learning/activity/year                 | activity / read_activity_year          |
+--------+-----------------------------------------+----------------------------------------+
```

All routes reach this service through `api_gateway` at `/api/learning/...`.

## Hard rules

- `Enrollment` is the aggregate root for course-enrollment state.
  `LessonCompletion` is an entity inside that aggregate. Mark a lesson as
  completed by going through the aggregate
  (`Enrollment.addLessonCompletion(...)` from `complete_lesson` interactor,
  which also updates `Enrollment.updatedAt`). Never mutate or persist a
  `LessonCompletion` directly through the JPA layer; never expose a
  standalone setter on `LessonCompletion` to the outside world.
- `Certificate` is its own aggregate, with a 1:1 relation to a completed
  `Enrollment`. Issuing a certificate goes through the
  `application/interactors/certificate/create_certificate` interactor and
  the `CertificateRepo` port. `application/certificate/CertificateStubS3Url`
  is a placeholder URL — when real S3 is wired up, introduce a
  `CertificateStorage` port in `application/ports/`, implement it under
  `infrastructure/adapters/...`, and wire it in
  `setup/config_beans/certificate/`. Do not import the AWS SDK directly
  from an interactor.
- `UserStudyDay` is the activity aggregate. It is updated transactionally
  from the enrollment use cases (`complete_lesson` increments the day,
  `leave_course` decrements according to the leaving enrollment's
  completed lessons) — keep that flow. A controller must never reach into
  `StudyActivityRepo` to write directly; activity changes follow lesson
  completions through the enrollment interactors.
- Cross-context references are by UUID. `Enrollment` holds `userId`,
  `courseId`, and `lessonId` as `UUID` values. There is no shared JPA
  entity with `course_service` or `user_service`, no foreign key, no
  cross-service join. Treat those IDs as opaque.
- All interactors run inside `TransactionManager.inTransaction(...)`.
  Do not annotate interactors with `@Transactional` and do not inject a
  Spring Data repository or `EntityManager` into them.
- Build with Gradle Groovy DSL: `./gradlew build` (the build script is
  `build.gradle`, not `build.gradle.kts`).

## Anti-patterns

- Skipping the aggregate by writing to a Spring Data JPA repository
  directly from an interactor or, worse, from a controller.
- Putting Spring annotations (`@Component`, `@Service`, `@Transactional`,
  `@Autowired`) or `jakarta.persistence.*` imports in `domain/`.
- Annotating an interactor with `@Transactional` instead of using the
  `TransactionManager` port.
- Mixing the three contexts (`enrollment`, `certificate`, `activity`) in
  one folder, one config class, or one handler.
- Returning `Hibernate*` JPA entities or application `*View` records
  directly from a `@RestController`. Map through
  `presentation/http/v1/mappers/<Aggregate>MapperQuery` to a response DTO.
- Calling the AWS SDK or any object-storage client from an interactor in
  place of `CertificateStubS3Url`. Add a port instead.

## Validation

Run from `learning_service/`:

```sh
./gradlew build      # compile + run tests + assemble
./gradlew check      # tests + verification tasks
./gradlew test       # tests only (fast feedback)
./gradlew bootRun    # boot the service on :8082
```

Tests use H2 in PostgreSQL compatibility mode driven by
`src/test/resources/application-test.yaml` with `ddl-auto: create-drop`,
so a running PostgreSQL is not required for the test profile. Production
runs PostgreSQL on `localhost:5437` with `ddl-auto: validate`; schema
changes ship as Liquibase changesets under
`deploy/liquibase/changelog/v.<version>/` referenced from
`db.changelog-master.yaml`.

Swagger UI: `http://localhost:8082/swagger-ui.html`.
OpenAPI JSON: `http://localhost:8082/v3/api-docs`.
