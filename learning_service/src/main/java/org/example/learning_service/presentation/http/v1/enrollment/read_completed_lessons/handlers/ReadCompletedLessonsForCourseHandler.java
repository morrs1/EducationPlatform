package org.example.learning_service.presentation.http.v1.enrollment.read_completed_lessons.handlers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.learning_service.application.interactors.enrollment.read_completed_lessons_for_course.ReadCompletedLessonsForCourseInteractor;
import org.example.learning_service.presentation.http.v1.enrollment.read_completed_lessons.dto.ReadCompletedLessonsForCourseResponse;
import org.example.learning_service.presentation.http.v1.mappers.EnrollmentMapperQuery;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/learning/enrollment")
@RequiredArgsConstructor
@Tag(name = "Learning enrollment", description = "Зачисление и прогресс по курсам")
public class ReadCompletedLessonsForCourseHandler {

    private final ReadCompletedLessonsForCourseInteractor readCompletedLessonsForCourseInteractor;
    private final EnrollmentMapperQuery enrollmentMapperQuery;

    @Operation(
            summary = "Список пройденных уроков по курсу",
            description = """
                    По паре пользователь / курс возвращает зачисление и все завершённые уроки
                    из learning_service (идентификаторы уроков совместимы с course_service).
                    """
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Данные найдены",
                    content = @Content(schema = @Schema(implementation = ReadCompletedLessonsForCourseResponse.class))
            ),
            @ApiResponse(responseCode = "404", description = "Зачисление не найдено")
    })
    @GetMapping("/completed-lessons")
    public ReadCompletedLessonsForCourseResponse readCompletedLessonsForCourse(
            @RequestParam("userId") UUID userId,
            @RequestParam("courseId") UUID courseId
    ) {
        return enrollmentMapperQuery.toReadCompletedLessonsForCourseResponse(
                readCompletedLessonsForCourseInteractor.readCompletedLessonsForCourse(userId, courseId)
        );
    }
}
