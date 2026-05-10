---
applyTo: "{api_gateway,user_service,course_service,learning_service}/**/*.java"
---

# Java / Spring Boot — Copilot Instructions

These rules apply to every Java file in any Spring Boot service. Read alongside the service's `AGENTS.md` for layer boundaries.

## Architecture

- Clean Architecture: `domain → application ← infrastructure → presentation`.
- `domain/` contains aggregates, entities, value objects, domain services, domain events. **No Spring, no JPA, no MapStruct, no Jackson imports.** Plain Java.
- `application/` contains interactors (one per use case), `ports/` (interfaces), `exceptions/`, `views/` (DTO outputs). Frameworks are forbidden except for what is needed at the language level.
- `infrastructure/` contains adapters that implement application `ports/`: JPA repositories, JPA entities + mappers, S3 / RabbitMQ / HTTP clients, transaction managers. **All Spring annotations live here.**
- `presentation/http/v1/<aggregate>/<operation>/{handlers,dto}/` — one folder per HTTP endpoint. Controllers delegate to interactors only.
- `setup/config_beans/` — `@Configuration` classes that wire ports to adapters. Each concern in its own subpackage.

## DDD Building Blocks

- Aggregates extend `BaseEntity` (or `BaseAggregateRoot` where present); value objects extend `BaseValueObject`. Constructors validate inputs and throw a domain exception (typically a subclass of `ValidateException`).
- Aggregates raise domain events; the application layer publishes them via an `EventBus` port. Domain events leave the service through the **outbox** table written in the same transaction.
- No setters on aggregates. Behavior is methods that mutate state and possibly emit events.

## Patterns

- **Constructor injection only.** No `@Autowired` on fields. Use Lombok `@RequiredArgsConstructor` where it does not hide intent.
- **MapStruct** for `domain ↔ JPA entity` mapping and for application views. Annotate with `@Mapper(componentModel = "spring")`.
- **Lombok**: `@Getter`, `@RequiredArgsConstructor`, `@Builder` are OK on JPA entities, DTOs, value objects. Avoid `@Data` on domain types (no setters).
- **Transactions** are owned by the application layer through a `TransactionManager` port, not by sprinkling `@Transactional` on the domain.
- **Outbox**: every cross-service event is written to an outbox table in the same DB transaction. A scheduler relays it to RabbitMQ.
- **Liquibase** for schema migrations under `deploy/liquibase/`.

## Testing (JUnit 5)

- Unit tests for domain and application logic. Use Arrange / Act / Assert. No `@SpringBootTest` for unit tests.
- Integration tests for adapters with Testcontainers (PostgreSQL, RabbitMQ) where present; H2 only when explicitly used.
- Name tests by behavior and expected outcome: `shouldRejectWhenEmailAlreadyExists`.
- Do not test framework wiring; trust Spring.

## Conventions

- Records are preferred for immutable DTOs and small value objects when consistent with surrounding code.
- Exceptions: domain throws `XxxException extends DomainException`; application throws `XxxException extends ApplicationException`. Presentation has an `ApiExceptionHandler` that maps them to HTTP codes.
- Logging: SLF4J. Log the **why** at INFO, payload context at DEBUG. Never log secrets.

## Validation

```sh
./gradlew build         # minimum after edit
./gradlew check         # before commit
./gradlew test          # tests only
```

Fix all compile errors and test failures before reporting work as done.
