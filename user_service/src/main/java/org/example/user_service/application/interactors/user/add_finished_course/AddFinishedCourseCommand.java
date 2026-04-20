package org.example.user_service.application.interactors.user.add_finished_course;

import java.util.UUID;

public record AddFinishedCourseCommand(UUID userId, UUID finishedCourseId) {
}
