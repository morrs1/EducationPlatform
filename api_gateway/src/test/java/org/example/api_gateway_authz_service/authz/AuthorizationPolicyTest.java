package org.example.api_gateway_authz_service.authz;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;

import java.net.URI;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AuthorizationPolicyTest {

    private final FakeCourseOwnershipVerifier ownershipVerifier = new FakeCourseOwnershipVerifier();
    private final AuthorizationPolicy policy = new AuthorizationPolicy(new ObjectMapper(), ownershipVerifier);
    private final URI targetUri = URI.create("http://localhost:8081/course");

    @Test
    void allowsAuthenticatedUserOnRegularApiRoutes() {
        AuthenticatedPrincipal user = principal(UserRole.USER);

        assertDoesNotThrow(() -> policy.authorize(HttpMethod.GET, "/api/course", user, targetUri, null));
        assertDoesNotThrow(() -> policy.authorize(
                HttpMethod.GET,
                "/api/course/by-author/%s/published".formatted(UUID.randomUUID()),
                user,
                targetUri,
                null
        ));
    }

    @Test
    void deniesUserOnDraftsCourseModificationAndRoleAssignment() {
        AuthenticatedPrincipal user = principal(UserRole.USER);

        assertThrows(
                AuthorizationDeniedException.class,
                () -> policy.authorize(
                        HttpMethod.GET,
                        "/api/course/by-author/%s/drafts".formatted(UUID.randomUUID()),
                        user,
                        targetUri,
                        null
                )
        );
        assertThrows(
                AuthorizationDeniedException.class,
                () -> policy.authorize(
                        HttpMethod.PATCH,
                        "/api/course/%s/publish".formatted(UUID.randomUUID()),
                        user,
                        targetUri,
                        null
                )
        );
        assertThrows(
                AuthorizationDeniedException.class,
                () -> policy.authorize(
                        HttpMethod.POST,
                        "/api/course/%s/module".formatted(UUID.randomUUID()),
                        user,
                        targetUri,
                        null
                )
        );
        assertThrows(
                AuthorizationDeniedException.class,
                () -> policy.authorize(
                        HttpMethod.PATCH,
                        "/api/user/%s/assign_author".formatted(UUID.randomUUID()),
                        user,
                        targetUri,
                        null
                )
        );
    }

    @Test
    void allowsAuthorToReadOwnDraftsAndModifyOwnCourse() {
        UUID authorId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();
        AuthenticatedPrincipal author = principal(authorId, UserRole.AUTHOR);
        ownershipVerifier.ownedCourseId = courseId;
        ownershipVerifier.ownerId = authorId;

        assertDoesNotThrow(
                () -> policy.authorize(
                        HttpMethod.PATCH,
                        "/api/course/%s/publish".formatted(courseId),
                        author,
                        targetUri,
                        null
                )
        );
        assertDoesNotThrow(
                () -> policy.authorize(
                        HttpMethod.POST,
                        "/api/course/%s/module".formatted(courseId),
                        author,
                        targetUri,
                        null
                )
        );
        assertDoesNotThrow(
                () -> policy.authorize(
                        HttpMethod.POST,
                        "/api/course",
                        author,
                        targetUri,
                        """
                                {"authorId":"%s","courseTitle":"Java"}
                                """.formatted(authorId).getBytes()
                )
        );
        assertDoesNotThrow(
                () -> policy.authorize(
                        HttpMethod.GET,
                        "/api/course/by-author/%s/drafts".formatted(authorId),
                        author,
                        targetUri,
                        null
                )
        );
    }

    @Test
    void deniesAuthorOnOtherAuthorsDraftsRoleAssignmentAndForeignCourseModification() {
        UUID authorId = UUID.randomUUID();
        UUID foreignCourseId = UUID.randomUUID();
        AuthenticatedPrincipal author = principal(authorId, UserRole.AUTHOR);
        ownershipVerifier.ownedCourseId = foreignCourseId;
        ownershipVerifier.ownerId = UUID.randomUUID();

        assertThrows(
                AuthorizationDeniedException.class,
                () -> policy.authorize(
                        HttpMethod.GET,
                        "/api/course/by-author/%s/drafts".formatted(UUID.randomUUID()),
                        author,
                        targetUri,
                        null
                )
        );
        assertThrows(
                AuthorizationDeniedException.class,
                () -> policy.authorize(
                        HttpMethod.PATCH,
                        "/api/user/%s/assign_admin".formatted(UUID.randomUUID()),
                        author,
                        targetUri,
                        null
                )
        );
        assertThrows(
                AuthorizationDeniedException.class,
                () -> policy.authorize(
                        HttpMethod.PATCH,
                        "/api/course/%s/publish".formatted(foreignCourseId),
                        author,
                        targetUri,
                        null
                )
        );
        assertThrows(
                AuthorizationDeniedException.class,
                () -> policy.authorize(
                        HttpMethod.POST,
                        "/api/course",
                        author,
                        targetUri,
                        """
                                {"authorId":"%s","courseTitle":"Java"}
                                """.formatted(UUID.randomUUID()).getBytes()
                )
        );
    }

    @Test
    void allowsSelfPasswordChangeForAnyRole() {
        UUID userId = UUID.randomUUID();
        AuthenticatedPrincipal user = principal(userId, UserRole.USER);

        assertDoesNotThrow(() -> policy.authorize(
                HttpMethod.PATCH,
                "/api/user/%s/change_password".formatted(userId),
                user,
                targetUri,
                null
        ));
    }

    @Test
    void allowsSelfEmailChangeForAnyRole() {
        UUID userId = UUID.randomUUID();
        AuthenticatedPrincipal user = principal(userId, UserRole.USER);

        assertDoesNotThrow(() -> policy.authorize(
                HttpMethod.PATCH,
                "/api/user/%s/change_email".formatted(userId),
                user,
                targetUri,
                null
        ));
    }

    @Test
    void deniesPasswordOrEmailChangeForAnotherUser() {
        UUID selfId = UUID.randomUUID();
        UUID otherId = UUID.randomUUID();

        assertThrows(
                AuthorizationDeniedException.class,
                () -> policy.authorize(
                        HttpMethod.PATCH,
                        "/api/user/%s/change_password".formatted(otherId),
                        principal(selfId, UserRole.USER),
                        targetUri,
                        null
                )
        );
        assertThrows(
                AuthorizationDeniedException.class,
                () -> policy.authorize(
                        HttpMethod.PATCH,
                        "/api/user/%s/change_password".formatted(otherId),
                        principal(selfId, UserRole.ADMIN),
                        targetUri,
                        null
                )
        );
        assertThrows(
                AuthorizationDeniedException.class,
                () -> policy.authorize(
                        HttpMethod.PATCH,
                        "/api/user/%s/change_email".formatted(otherId),
                        principal(selfId, UserRole.USER),
                        targetUri,
                        null
                )
        );
        assertThrows(
                AuthorizationDeniedException.class,
                () -> policy.authorize(
                        HttpMethod.PATCH,
                        "/api/user/%s/change_email".formatted(otherId),
                        principal(selfId, UserRole.ADMIN),
                        targetUri,
                        null
                )
        );
    }

    @Test
    void allowsAdminEverywhere() {
        AuthenticatedPrincipal admin = principal(UserRole.ADMIN);

        assertDoesNotThrow(() -> policy.authorize(
                HttpMethod.GET,
                "/api/course/by-author/%s/drafts".formatted(UUID.randomUUID()),
                admin,
                targetUri,
                null
        ));
        assertDoesNotThrow(() -> policy.authorize(
                HttpMethod.PATCH,
                "/api/course/%s/publish".formatted(UUID.randomUUID()),
                admin,
                targetUri,
                null
        ));
        assertDoesNotThrow(() -> policy.authorize(
                HttpMethod.PATCH,
                "/api/user/%s/assign_admin".formatted(UUID.randomUUID()),
                admin,
                targetUri,
                null
        ));
    }

    private static AuthenticatedPrincipal principal(UserRole role) {
        return principal(UUID.randomUUID(), role);
    }

    private static AuthenticatedPrincipal principal(UUID id, UserRole role) {
        return new AuthenticatedPrincipal(id, "user@example.com", role, "ACTIVE");
    }

    private static class FakeCourseOwnershipVerifier implements CourseOwnershipVerifier {

        private UUID ownedCourseId;
        private UUID ownedLessonId;
        private UUID ownerId;

        @Override
        public boolean isCourseOwnedBy(URI targetUri, UUID courseId, UUID authorId) {
            return courseId.equals(ownedCourseId) && authorId.equals(ownerId);
        }

        @Override
        public boolean isLessonOwnedBy(URI targetUri, UUID lessonId, UUID authorId) {
            return lessonId.equals(ownedLessonId) && authorId.equals(ownerId);
        }
    }
}
