package org.example.user_service.application.interactors.user.read_user_by_id;

import java.util.List;

public record ReadUserByIdView(
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
