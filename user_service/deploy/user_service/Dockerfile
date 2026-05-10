# syntax=docker/dockerfile:1.7
#
# Multi-stage build for user_service.
#
# 1. `builder` resolves Gradle dependencies, compiles the project, runs `bootJar`,
#    and extracts the Spring Boot layered jar so the runtime image can copy each
#    layer separately (best-cached layer first).
# 2. `runtime` is a minimal JRE image that runs the layered jar as a non-root
#    user under tini for clean signal handling.
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

# 2. Copy sources and produce a Spring Boot fat jar. Tests are skipped: the CI
#    pipeline runs them in a dedicated job; rerunning them in the image build
#    only slows iteration.
COPY src ./src
RUN ./gradlew --no-daemon --quiet -x test bootJar && \
    mkdir -p /workspace/extracted && \
    cd /workspace/extracted && \
    java -Djarmode=tools -jar /workspace/build/libs/*-SNAPSHOT.jar extract --layers --launcher

# ─── Runtime ─────────────────────────────────────────────────────────────────
FROM ${JRE_IMAGE} AS runtime

# curl powers HEALTHCHECK; tini ensures Java reaps zombies and forwards signals.
RUN apk add --no-cache curl tini && \
    addgroup -S app && \
    adduser -S -G app -h /app app

WORKDIR /app

# Copy layered jar contents in cache-friendly order (least to most volatile).
# Spring Boot's `tools` jarmode produces: dependencies / spring-boot-loader /
# snapshot-dependencies / application.
COPY --from=builder --chown=app:app /workspace/extracted/dependencies/         ./
COPY --from=builder --chown=app:app /workspace/extracted/spring-boot-loader/   ./
COPY --from=builder --chown=app:app /workspace/extracted/snapshot-dependencies/ ./
COPY --from=builder --chown=app:app /workspace/extracted/application/          ./

USER app

ENV USER_SERVICE_SERVER_PORT=8080 \
    JAVA_TOOL_OPTIONS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=5 \
    CMD curl -fsSL "http://localhost:${USER_SERVICE_SERVER_PORT}/v3/api-docs" >/dev/null || exit 1

ENTRYPOINT ["/sbin/tini", "--", "java", "org.springframework.boot.loader.launch.JarLauncher"]
