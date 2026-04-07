package org.example.user_service.presentation.http.v1.user.create.dto;

import java.util.List;

public record CreateUserRequest(String surname,
                                String name,
                                String patronymic,
                                String userStatus,
                                String userEmail,
                                String userPassword,
                                String userProfilePhotoLink,
                                List<String> currentCourses,
                                List<String> finishedCourses,
                                List<String> certificates) {
}
