package org.example.api_gateway_authz_service.authz;

import java.net.URI;
import java.util.UUID;

public interface CourseOwnershipVerifier {

    boolean isCourseOwnedBy(URI targetUri, UUID courseId, UUID authorId);

    boolean isLessonOwnedBy(URI targetUri, UUID lessonId, UUID authorId);
}
