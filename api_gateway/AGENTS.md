# AGENTS.md

## Scope

This file applies to everything under `api_gateway/`. It is the single public entry point for the EducationPlatform backend: authentication, authorization, and reverse proxying to the downstream Spring Boot services (`user_service`, `course_service`, `learning_service`). The root `AGENTS.md` at the repo root still applies; rules below take precedence inside this directory.

## Project Snapshot

Spring Boot 4.0.6 application on Java 25, built with Gradle Kotlin DSL.

- Base package: `org.example.api_gateway_authz_service`
- Entry point: `ApiGatewayApplication`
- Default port: `8090` (override via `SERVER_PORT`)
- Build file: `build.gradle.kts`
- Spring config: `src/main/resources/application.yaml`
- Tests: JUnit 5 under `src/test/java/.../auth`, `.../authz`, `.../gateway/web`

Top-level package layout:

```
auth/        - public /auth endpoints + JWT issuing + user_service client
authz/       - role + ownership policy enforced on proxied requests
gateway/     - reverse proxy: controller, forward service, route resolver
setup/       - cross-cutting config beans (OpenAPI)
```

No database, no message broker, no cache. The gateway is a stateless HTTP-only component.

## Architecture Rules

The gateway has exactly three responsibilities. Do not mix code across them.

1. `auth/` owns user-facing authentication.
   - `AuthController` exposes `POST /auth/register` and `POST /auth/login`. These do not go through the proxy.
   - `UserServiceAuthClient` is the only place that calls `user_service` for register/login. Do not call `user_service` for auth from anywhere else.
   - `JwtTokenService` is the only place that creates or parses gateway JWTs. It hand-rolls HS256; do not pull in an external JWT library without an explicit request.
   - JWT claims are fixed: `sub`, `email`, `role`, `userStatus`, `iat`, `exp`. Keep them aligned with `AuthenticatedPrincipal`.
2. `authz/` owns authorization for proxied traffic.
   - All authorization decisions live in `AuthorizationPolicy.authorize(...)`. Do not scatter role checks into the proxy or into clients.
   - Course ownership questions go through `CourseOwnershipVerifier` (implemented by `CourseServiceOwnershipClient`). Do not call `course_service` directly from elsewhere for ownership.
   - `AuthorizationDeniedException` and `JwtAuthenticationException` are the only auth-related failure types that downstream code is allowed to throw. `AuthorizationExceptionHandler` and `AuthExceptionHandler` translate them to HTTP responses.
3. `gateway/` owns transport.
   - Routing rules live exclusively in `application.yaml` under `gateway.routes` and are bound through `GatewayProperties`. Add new downstream services by adding routes there, not by adding new controllers.
   - `RouteResolver` picks the route by longest `path-prefix` match. Order in YAML does not matter, but longer prefixes (e.g. `/api/course/lesson`) MUST exist as separate entries if they need different targets than their parent prefix.
   - `ProxyForwardService` is the only place that performs the upstream HTTP call. Keep it agnostic of business rules.
   - `HopByHopHeaders` is the source of truth for which headers must be stripped both inbound and outbound.

Cross-cutting:

- The `ProxyController` is the only entry point for proxied traffic. It runs authentication, then `AuthorizationPolicy.authorize`, then forwards. Do not add a second proxy controller.
- Public, anonymous reads are whitelisted inside `ProxyController.isPublicPublishedCourseRead`. If a new public path is needed, extend that method explicitly; do not weaken the JWT check globally.
- Admins (`UserRole.ADMIN`) bypass the policy in `authorize(...)`. Preserve that early-return.

## Coding Standards

- Java 25. Prefer `record` for DTOs and value carriers (see `AuthenticatedUser`, `AuthenticatedPrincipal`, `JwtProperties`, request/response DTOs in `auth/dto/` and `auth/client/`).
- Spring beans use constructor injection. Do not introduce field injection.
- Configuration is bound via `@ConfigurationProperties` records/classes registered on `ApiGatewayApplication` with `@EnableConfigurationProperties`. New config groups must be added there too.
- HTTP calls go through the shared `RestClient` bean from `GatewayClientConfig`. Do not instantiate a second `RestClient` or fall back to `RestTemplate`.
- Use `org.springframework.http.HttpMethod` and `HttpHeaders` constants instead of raw strings where possible.
- Keep regex patterns in `AuthorizationPolicy` as `private static final Pattern` fields and document the URI shape they match.
- Log via SLF4J (`org.slf4j.Logger`), as in `ProxyForwardService`. Do not introduce `System.out`/`System.err`.
- Comments and identifiers: existing comments in `application.yaml`, `GatewayProperties`, and `RouteResolver` are in Russian. Keep existing Russian comments intact; write new code comments in English unless extending an existing Russian block.

## Validation

Run from `api_gateway/`. The Gradle wrapper is committed.

```sh
./gradlew bootRun       # local run on :8090
./gradlew build         # compile + test + assemble
./gradlew test          # JUnit 5 only
```

Validation expectations:

- Touching `authz/AuthorizationPolicy.java`, `auth/JwtTokenService.java`, or `gateway/web/ProxyController.java`: always run `./gradlew test`. They have dedicated suites (`AuthorizationPolicyTest`, `JwtTokenServiceTest`, `ProxyControllerTest`).
- Touching routing (`RouteResolver`, `GatewayProperties`, `application.yaml`): run `./gradlew test` and also start `bootRun` if reasonable; routing regressions are not always caught by unit tests.
- Pure documentation / comment changes: no Gradle run required.

There is no separate lint task configured; `./gradlew build` covers compile-time checks.

## Practical Editing Rules

- Do not edit generated Gradle wrapper files (`gradlew`, `gradlew.bat`, `gradle/wrapper/`).
- Do not commit secret values into `application.yaml`. The `JWT_SECRET` default (`dev-secret-change-me-at-least-32-chars`) is intentionally weak and must stay as a dev-only fallback.
- When adding a downstream route, also confirm the downstream service actually exposes the path after `strip-prefix: /api` is applied. See the worked examples at the bottom of `application.yaml`.
- When changing JWT claim names or shapes, update both `JwtTokenService.createToken` and `JwtTokenService.parseBearerToken`, and adjust `AuthenticatedPrincipal` / `AuthenticatedUser` accordingly.
- When a new policy rule needs course or lesson ownership, route it through `CourseOwnershipVerifier`. Add new verifier methods on the interface rather than calling `RestClient` from `AuthorizationPolicy`.
- Public-read whitelist: edit only `ProxyController.isPublicPublishedCourseRead` and its private `Pattern` fields. Do not introduce a parallel whitelist mechanism.

## Good Defaults for Agents

- Treat `application.yaml` as the routing source of truth. If a path is not listed there, the gateway returns 404 by design.
- Prefer adding tests next to existing ones: policy changes get a case in `AuthorizationPolicyTest`, JWT changes in `JwtTokenServiceTest`, proxy/whitelist changes in `ProxyControllerTest`.
- Keep `AuthorizationPolicy` declarative: pattern match the path, decide, `deny(...)` or return. Avoid hidden side effects.
- Do not extend the gateway with business logic that belongs in a downstream service. If a feature requires data, expose it from the owning service and proxy it.
- The gateway should remain reverse-proxy in spirit: stateless, no per-request DB calls beyond the ownership lookup, no caching layer added implicitly.
