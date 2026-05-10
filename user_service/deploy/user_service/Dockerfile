# syntax=docker/dockerfile:1.7
#
# Multi-stage build for user_service.
#
# 1. `builder` resolves Gradle dependencies, compiles the project, and runs
#    `bootJar`. Dependency resolution lives on its own layer so source-only
#    changes do not invalidate it.
# 2. `runtime` is a minimal JRE image that runs the resulting Spring Boot fat
#    jar as a non-root user under tini for clean signal handling.
#
# Build from the repository's `user_service/` directory:
#   docker build -f deploy/user_service/Dockerfile -t user_service:latest .
#
# Override via build args if you need a different toolchain:
#   docker build --build-arg JDK_IMAGE=eclipse-temurin:25-jdk -f deploy/user_service/Dockerfile -t user_service:latest .

ARG JDK_IMAGE=eclipse-temurin:25-jdk-alpine
ARG JRE_IMAGE=eclipse-temurin:25-jre-alpine

# ─── Builder ─────────────────────────────────────────────────────────────────
FROM ${JDK_IMAGE} AS builder

WORKDIR /workspace

# 1. Copy the bare minimum needed to resolve dependencies. This layer stays
#    cached as long as build.gradle.kts / settings.gradle.kts / the wrapper
#    do not change, even if source files do.
COPY gradlew ./
COPY gradle ./gradle
COPY settings.gradle.kts build.gradle.kts ./
COPY config ./config

# Pre-fetch dependencies into the Gradle cache. We accept failures here so the
# build does not break on offline environments — `bootJar` below will retry.
RUN chmod +x ./gradlew && \
    ./gradlew --no-daemon --quiet dependencies > /dev/null 2>&1 || true

# 2. Copy sources and produce a Spring Boot fat jar. Tests are skipped — CI
#    runs them in a dedicated job; rerunning them inside the image build only
#    slows iteration. The produced jar is copied to a known path so the
#    runtime stage does not depend on its versioned filename.
COPY src ./src
RUN ./gradlew --no-daemon --quiet -x test bootJar && \
    cp /workspace/build/libs/*-SNAPSHOT.jar /workspace/app.jar

# ─── Runtime ─────────────────────────────────────────────────────────────────
FROM ${JRE_IMAGE} AS runtime

# curl powers HEALTHCHECK; tini ensures Java reaps zombies and forwards signals.
RUN apk add --no-cache curl tini && \
    addgroup -S app && \
    adduser -S -G app -h /app app

WORKDIR /app

COPY --from=builder --chown=app:app /workspace/app.jar /app/app.jar

USER app

ENV USER_SERVICE_SERVER_PORT=8080 \
    JAVA_TOOL_OPTIONS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=5 \
    CMD curl -fsSL "http://localhost:${USER_SERVICE_SERVER_PORT}/v3/api-docs" >/dev/null || exit 1

ENTRYPOINT ["/sbin/tini", "--", "java", "-jar", "/app/app.jar"]
