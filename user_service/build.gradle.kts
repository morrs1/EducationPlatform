plugins {
    java
    checkstyle
    id("org.springframework.boot") version "4.0.3"
    id("io.spring.dependency-management") version "1.1.7"
    id("com.diffplug.spotless") version "6.25.0"
}

group = "org.example"
version = "0.0.1-SNAPSHOT"
description = "user_service"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

repositories {
    mavenCentral()
}

val integrationTest: SourceSet by sourceSets.creating {
    java.srcDir("src/integrationTest/java")
    resources.srcDir("src/integrationTest/resources")
    compileClasspath += sourceSets["main"].output + sourceSets["test"].output
    runtimeClasspath += sourceSets["main"].output + sourceSets["test"].output
}

configurations {
    named("integrationTestImplementation") { extendsFrom(configurations["testImplementation"]) }
    named("integrationTestRuntimeOnly") { extendsFrom(configurations["testRuntimeOnly"]) }
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter")
    implementation("org.springframework.security:spring-security-crypto")
    implementation("software.amazon.awssdk:s3:2.42.14")
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:3.0.1")
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")
    implementation("org.springframework.boot:spring-boot-starter-webmvc")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-jdbc")
    runtimeOnly("org.postgresql:postgresql")
    implementation("org.mapstruct:mapstruct:1.6.3")
    annotationProcessor("org.mapstruct:mapstruct-processor:1.6.3")
    annotationProcessor("org.projectlombok:lombok-mapstruct-binding:0.2.0")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testCompileOnly("org.projectlombok:lombok")
    testAnnotationProcessor("org.projectlombok:lombok")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")

    "integrationTestImplementation"("org.springframework.boot:spring-boot-starter-test")
    "integrationTestImplementation"("org.springframework.boot:spring-boot-starter-data-jpa")
    "integrationTestImplementation"("org.testcontainers:postgresql:1.20.4")
    "integrationTestImplementation"("org.testcontainers:junit-jupiter:1.20.4")
    "integrationTestRuntimeOnly"("org.postgresql:postgresql")
}

tasks.withType<Test>().configureEach {
    useJUnitPlatform()
    testLogging {
        events("passed", "failed", "skipped")
        showStandardStreams = false
    }
}

// `UserServiceApplicationTests` is a @SpringBootTest smoke test that needs a real
// datasource. Exclude it from the default `test` task; CI relies on the
// integration tests (Testcontainers) for end-to-end Spring wiring coverage.
tasks.named<Test>("test") {
    exclude("**/UserServiceApplicationTests.class")
}

val integrationTestTask = tasks.register<Test>("integrationTest") {
    description = "Runs integration tests with Testcontainers."
    group = "verification"
    testClassesDirs = integrationTest.output.classesDirs
    classpath = integrationTest.runtimeClasspath
    shouldRunAfter("test")
}

checkstyle {
    toolVersion = "10.18.2"
    configFile = file("config/checkstyle/checkstyle.xml")
    isIgnoreFailures = false
    maxWarnings = 0
}

tasks.named<Checkstyle>("checkstyleMain") {
    reports {
        xml.required.set(false)
        html.required.set(true)
    }
}

tasks.named<Checkstyle>("checkstyleTest") {
    reports {
        xml.required.set(false)
        html.required.set(true)
    }
}

// The Checkstyle plugin auto-creates a checkstyle<SourceSetName> task for every
// source set, so `checkstyleIntegrationTest` already exists — we only configure it.
tasks.named<Checkstyle>("checkstyleIntegrationTest") {
    reports {
        xml.required.set(false)
        html.required.set(true)
    }
}

tasks.named("check") {
    dependsOn(integrationTestTask)
}

spotless {
    java {
        target("src/**/*.java")
        targetExclude("**/generated/**")
        removeUnusedImports()
        trimTrailingWhitespace()
        endWithNewline()
        importOrder(
            "java",
            "javax",
            "jakarta",
            "org",
            "com",
            ""
        )
        toggleOffOn()
    }
    format("misc") {
        target("*.md", "*.gradle.kts", ".gitignore")
        trimTrailingWhitespace()
        endWithNewline()
    }
}
