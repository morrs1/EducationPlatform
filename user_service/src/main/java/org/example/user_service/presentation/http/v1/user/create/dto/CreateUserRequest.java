package org.example.user_service.presentation.http.v1.user.create.dto;

import java.util.List;
import java.util.UUID;

public record CreateUserRequest(String surname,
                                String name,
                                String patronymic,
                                String userStatus,
                                String userEmail,
                                String userPassword,
                                String userProfilePhotoLink,
                                List<UUID> currentCourses,
                                List<UUID> finishedCourses,
                                List<UUID> certificates) {
}
