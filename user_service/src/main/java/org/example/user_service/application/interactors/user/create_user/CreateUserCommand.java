package org.example.user_service.application.interactors.user.create_user;

import java.util.List;
import java.util.UUID;

public record CreateUserCommand(String surname,
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
