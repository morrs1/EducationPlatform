package org.example.user_service.application.interactors.user.read_user_by_id;

import java.util.List;
import java.util.UUID;

public record ReadUserByIdView(
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
