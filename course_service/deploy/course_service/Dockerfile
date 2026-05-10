# syntax=docker/dockerfile:1.7
# Build: docker build -f deploy/course_service/Dockerfile -t course_service:latest .

ARG JDK_IMAGE=eclipse-temurin:25-jdk-alpine
ARG JRE_IMAGE=eclipse-temurin:25-jre-alpine

FROM ${JDK_IMAGE} AS builder

WORKDIR /workspace

COPY gradlew ./
COPY gradle ./gradle
COPY settings.gradle.kts build.gradle.kts ./

RUN chmod +x ./gradlew && \
    ./gradlew --no-daemon --quiet dependencies > /dev/null 2>&1 || true

COPY src ./src
RUN ./gradlew --no-daemon --quiet -x test bootJar && \
    cp /workspace/build/libs/*-SNAPSHOT.jar /workspace/app.jar

FROM ${JRE_IMAGE} AS runtime

# tini handles signal forwarding and zombie reaping for the Java process.
RUN apk add --no-cache curl tini && \
    addgroup -S app && \
    adduser -S -G app -h /app app

WORKDIR /app

COPY --from=builder --chown=app:app /workspace/app.jar /app/app.jar

USER app

ENV COURSE_SERVICE_SERVER_PORT=8081 \
    JAVA_TOOL_OPTIONS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=5 \
    CMD curl -fsSL "http://localhost:${COURSE_SERVICE_SERVER_PORT}/v3/api-docs" >/dev/null || exit 1

ENTRYPOINT ["/sbin/tini", "--", "java", "-jar", "/app/app.jar"]
