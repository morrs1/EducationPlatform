package org.example.user_service.application.interactors.create_user;

import java.util.List;

public record CreateUserCommand(String surname,
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
