package org.example.learning_service.presentation.http.v1.enrollment.complete_course.handlers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.learning_service.application.interactors.enrollment.complete_course.CompleteCourseCommand;
import org.example.learning_service.application.interactors.enrollment.complete_course.CompleteCourseInteractor;
import org.example.learning_service.presentation.http.v1.enrollment.complete_course.dto.CompleteCourseRequest;
import org.example.learning_service.presentation.http.v1.enrollment.complete_course.dto.CompleteCourseResponse;
import org.example.learning_service.presentation.http.v1.mappers.EnrollmentMapperQuery;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/learning/enrollment")
@RequiredArgsConstructor
@Tag(name = "Learning enrollment", description = "Зачисление и прогресс по курсам")
public class CompleteCourseHandler {

    private final CompleteCourseInteractor completeCourseInteractor;
    private final EnrollmentMapperQuery enrollmentMapperQuery;

    @Operation(
            summary = "Завершить курс пользователем",
            description = """
                    Переводит зачисление из «in_progress» в «completed» (если ещё не завершено).
                    Набор завершённых уроков в БД сохраняется без изменений.
                    """
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Курс отмечен как завершённый",
                    content = @Content(schema = @Schema(implementation = CompleteCourseResponse.class))
            ),
            @ApiResponse(responseCode = "404", description = "Зачисление не найдено"),
            @ApiResponse(responseCode = "400", description = "Уже завершено или нарушены правила домена")
    })
    @PostMapping("/complete-course")
    public ResponseEntity<CompleteCourseResponse> complete(@RequestBody CompleteCourseRequest request) {
        var body = enrollmentMapperQuery.toCompleteCourseResponse(
                completeCourseInteractor.execute(
                        new CompleteCourseCommand(request.userId(), request.courseId(), request.completedAt())
                )
        );
        return ResponseEntity.ok(body);
    }
}
