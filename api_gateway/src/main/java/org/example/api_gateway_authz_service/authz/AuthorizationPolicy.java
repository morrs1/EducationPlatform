package org.example.api_gateway_authz_service.authz;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class AuthorizationPolicy {

    private static final Pattern AUTHOR_DRAFTS_PATH =
            Pattern.compile("^/api/course/by-author/([^/]+)/drafts/?$");
    private static final Pattern COURSE_WRITE_BY_ID_PATH =
            Pattern.compile("^/api/course/[^/]+/publish/?$");
    private static final Pattern ADD_MODULE_PATH =
            Pattern.compile("^/api/course/([^/]+)/module/?$");
    private static final Pattern ADD_LESSON_PATH =
            Pattern.compile("^/api/course/lesson/?$");
    private static final Pattern LESSON_WRITE_BY_ID_PATH =
            Pattern.compile("^/api/course/lesson/([^/]+)(/asset)?/?$");
    private static final Pattern ASSIGN_ROLE_PATH =
            Pattern.compile("^/api/user/[^/]+/assign_(author|admin)/?$");
    private static final Pattern CHANGE_PASSWORD_PATH =
            Pattern.compile("^/api/user/([^/]+)/change_password/?$");
    private static final Pattern CHANGE_EMAIL_PATH =
            Pattern.compile("^/api/user/([^/]+)/change_email/?$");

    private final ObjectMapper objectMapper;
    private final CourseOwnershipVerifier courseOwnershipVerifier;

    public AuthorizationPolicy(ObjectMapper objectMapper, CourseOwnershipVerifier courseOwnershipVerifier) {
        this.objectMapper = objectMapper;
        this.courseOwnershipVerifier = courseOwnershipVerifier;
    }

    public void authorize(
            HttpMethod method,
            String path,
            AuthenticatedPrincipal principal,
            URI targetUri,
            byte[] requestBody) {
        if (enforceSelfOnlyUserPatch(
                method, path, principal, CHANGE_PASSWORD_PATH,
                "Password can be changed only for your own account")) {
            return;
        }
        if (enforceSelfOnlyUserPatch(
                method, path, principal, CHANGE_EMAIL_PATH,
                "Email can be changed only for your own account")) {
            return;
        }

        if (principal.role() == UserRole.ADMIN) {
            return;
        }

        if (isAssignRole(method, path)) {
            deny("Only admin can assign roles");
        }

        Optional<UUID> draftsAuthorId = draftAuthorId(method, path);
        if (draftsAuthorId.isPresent()) {
            if (principal.role() == UserRole.AUTHOR && principal.id().equals(draftsAuthorId.get())) {
                return;
            }
            deny("Only course author or admin can read draft courses");
        }

        if (isCourseWrite(method, path)) {
            if (principal.role() != UserRole.AUTHOR) {
                deny("Only author or admin can modify courses");
            }
            authorizeAuthorCourseWrite(method, path, principal, targetUri, requestBody);
        }
    }

    private static boolean isAssignRole(HttpMethod method, String path) {
        return HttpMethod.PATCH.equals(method) && ASSIGN_ROLE_PATH.matcher(path).matches();
    }

    /**
     * These user_service PATCH routes must target the authenticated user only (even for ADMIN).
     */
    private static boolean enforceSelfOnlyUserPatch(
            HttpMethod method,
            String path,
            AuthenticatedPrincipal principal,
            Pattern pathPattern,
            String denyMessageIfForeignUser) {
        if (!HttpMethod.PATCH.equals(method)) {
            return false;
        }
        Matcher matcher = pathPattern.matcher(path);
        if (!matcher.matches()) {
            return false;
        }
        UUID targetUserId;
        try {
            targetUserId = UUID.fromString(matcher.group(1));
        } catch (IllegalArgumentException ex) {
            throw new AuthorizationDeniedException("Invalid user id");
        }
        if (!principal.id().equals(targetUserId)) {
            deny(denyMessageIfForeignUser);
        }
        return true;
    }

    private void authorizeAuthorCourseWrite(
            HttpMethod method,
            String path,
            AuthenticatedPrincipal principal,
            URI targetUri,
            byte[] requestBody) {

        if (HttpMethod.POST.equals(method) && "/api/course".equals(path)) {
            UUID authorId = uuidFromBody(requestBody, "authorId");
            if (principal.id().equals(authorId)) {
                return;
            }
            deny("Author can create only own courses");
        }

        Optional<UUID> courseId = courseIdFromPath(method, path);
        if (courseId.isPresent()) {
            if (courseOwnershipVerifier.isCourseOwnedBy(targetUri, courseId.get(), principal.id())) {
                return;
            }
            deny("Author can modify only own courses");
        }

        if (HttpMethod.POST.equals(method) && ADD_LESSON_PATH.matcher(path).matches()) {
            UUID courseIdFromBody = uuidFromBody(requestBody, "courseId");
            if (courseOwnershipVerifier.isCourseOwnedBy(targetUri, courseIdFromBody, principal.id())) {
                return;
            }
            deny("Author can modify only own courses");
        }

        Optional<UUID> lessonId = lessonIdFromPath(method, path);
        if (lessonId.isPresent()) {
            if (courseOwnershipVerifier.isLessonOwnedBy(targetUri, lessonId.get(), principal.id())) {
                return;
            }
            deny("Author can modify only own courses");
        }

        deny("Course modification route is not allowed");
    }

    private static boolean isCourseWrite(HttpMethod method, String path) {
        if (!isUnsafeMethod(method)) {
            return false;
        }
        return path.equals("/api/course") || path.startsWith("/api/course/");
    }

    private static boolean isUnsafeMethod(HttpMethod method) {
        return HttpMethod.POST.equals(method)
                || HttpMethod.PUT.equals(method)
                || HttpMethod.PATCH.equals(method)
                || HttpMethod.DELETE.equals(method);
    }

    private static Optional<UUID> courseIdFromPath(HttpMethod method, String path) {
        if (HttpMethod.PATCH.equals(method) && COURSE_WRITE_BY_ID_PATH.matcher(path).matches()) {
            return firstUuid(path, "^/api/course/([^/]+)/publish/?$");
        }
        if (HttpMethod.POST.equals(method)) {
            Matcher matcher = ADD_MODULE_PATH.matcher(path);
            if (matcher.matches()) {
                return uuidFromPathGroup(matcher.group(1));
            }
        }
        return Optional.empty();
    }

    private static Optional<UUID> lessonIdFromPath(HttpMethod method, String path) {
        if (!HttpMethod.PATCH.equals(method) && !HttpMethod.POST.equals(method)) {
            return Optional.empty();
        }
        Matcher matcher = LESSON_WRITE_BY_ID_PATH.matcher(path);
        if (!matcher.matches()) {
            return Optional.empty();
        }
        return uuidFromPathGroup(matcher.group(1));
    }

    private static Optional<UUID> draftAuthorId(HttpMethod method, String path) {
        if (!HttpMethod.GET.equals(method)) {
            return Optional.empty();
        }

        Matcher matcher = AUTHOR_DRAFTS_PATH.matcher(path);
        if (!matcher.matches()) {
            return Optional.empty();
        }

        try {
            return Optional.of(UUID.fromString(matcher.group(1)));
        } catch (IllegalArgumentException ex) {
            throw new AuthorizationDeniedException("Invalid author id");
        }
    }

    private UUID uuidFromBody(byte[] requestBody, String fieldName) {
        if (requestBody == null || requestBody.length == 0) {
            deny("Missing course ownership data");
        }

        try {
            JsonNode root = objectMapper.readTree(requestBody);
            JsonNode value = root.get(fieldName);
            if (value == null || !value.isTextual()) {
                deny("Missing course ownership data");
            }
            return UUID.fromString(value.asText());
        } catch (IOException | IllegalArgumentException ex) {
            throw new AuthorizationDeniedException("Invalid course ownership data");
        }
    }

    private static Optional<UUID> firstUuid(String path, String pattern) {
        Matcher matcher = Pattern.compile(pattern).matcher(path);
        if (!matcher.matches()) {
            return Optional.empty();
        }
        return uuidFromPathGroup(matcher.group(1));
    }

    private static Optional<UUID> uuidFromPathGroup(String value) {
        try {
            return Optional.of(UUID.fromString(value));
        } catch (IllegalArgumentException ex) {
            throw new AuthorizationDeniedException("Invalid course id");
        }
    }

    private static void deny(String message) {
        throw new AuthorizationDeniedException(message);
    }
}
