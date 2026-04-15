package org.example.user_service.presentation.http.v1.user.read_by_id.dto;

import java.util.List;
import java.util.UUID;

public record ReadUserByIdResponse(
        String surname,
        String name,
        String patronymic,
        String userStatus,
        String userEmail,
        String userProfilePhotoLink,
        List<UUID> currentCourses,
        List<UUID> finishedCourses,
        List<UUID> certificates
) {
}
