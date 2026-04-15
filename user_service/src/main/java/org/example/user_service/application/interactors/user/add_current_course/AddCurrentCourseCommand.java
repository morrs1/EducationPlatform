package org.example.user_service.application.interactors.user.add_current_course;

import java.util.UUID;

public record AddCurrentCourseCommand(UUID userId, UUID currentCourseId) {
}
