package org.example.api_gateway_authz_service.authz;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.net.URI;
import java.util.Optional;
import java.util.UUID;

@Component
public class CourseServiceOwnershipClient implements CourseOwnershipVerifier {

    private final RestClient restClient;

    public CourseServiceOwnershipClient(RestClient restClient) {
        this.restClient = restClient;
    }

    @Override
    public boolean isCourseOwnedBy(URI targetUri, UUID courseId, UUID authorId) {
        return readCourseAuthorId(targetUri, courseId)
                .map(authorId::equals)
                .orElse(false);
    }

    @Override
    public boolean isLessonOwnedBy(URI targetUri, UUID lessonId, UUID authorId) {
        return readLessonCourseId(targetUri, lessonId)
                .map(courseId -> isCourseOwnedBy(targetUri, courseId, authorId))
                .orElse(false);
    }

    private Optional<UUID> readCourseAuthorId(URI targetUri, UUID courseId) {
        URI uri = baseUri(targetUri).resolve("/course/" + courseId);
        try {
            CourseAuthorResponse response = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(CourseAuthorResponse.class);
            return response == null ? Optional.empty() : Optional.of(response.authorId());
        } catch (RestClientResponseException ex) {
            if (HttpStatus.NOT_FOUND.equals(ex.getStatusCode())) {
                return Optional.empty();
            }
            throw ex;
        }
    }

    private Optional<UUID> readLessonCourseId(URI targetUri, UUID lessonId) {
        URI uri = baseUri(targetUri).resolve("/course/lesson/" + lessonId);
        try {
            LessonCourseResponse response = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(LessonCourseResponse.class);
            return response == null ? Optional.empty() : Optional.of(response.courseId());
        } catch (RestClientResponseException ex) {
            if (HttpStatus.NOT_FOUND.equals(ex.getStatusCode())) {
                return Optional.empty();
            }
            throw ex;
        }
    }

    private static URI baseUri(URI targetUri) {
        return URI.create(targetUri.getScheme() + "://" + targetUri.getAuthority());
    }

    private record CourseAuthorResponse(UUID authorId) {
    }

    private record LessonCourseResponse(UUID courseId) {
    }
}
