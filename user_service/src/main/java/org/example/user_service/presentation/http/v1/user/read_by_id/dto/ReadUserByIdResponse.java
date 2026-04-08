package org.example.user_service.presentation.http.v1.user.read_by_id.dto;

import java.util.List;

public record ReadUserByIdResponse(
        String surname,
        String name,
        String patronymic,
        String userStatus,
        String userEmail,
        String userProfilePhotoLink,
        List<String> currentCourses,
        List<String> finishedCourses,
        List<String> certificates
) {
}
