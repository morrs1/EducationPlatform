package org.example.learning_service.presentation.http.v1.enrollment.complete_lesson.handlers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.learning_service.application.interactors.enrollment.complete_lesson.CompleteLessonCommand;
import org.example.learning_service.application.interactors.enrollment.complete_lesson.CompleteLessonInteractor;
import org.example.learning_service.presentation.http.v1.enrollment.complete_lesson.dto.CompleteLessonRequest;
import org.example.learning_service.presentation.http.v1.enrollment.complete_lesson.dto.CompleteLessonResponse;
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
public class CompleteLessonHandler {

    private final CompleteLessonInteractor completeLessonInteractor;
    private final EnrollmentMapperQuery enrollmentMapperQuery;

    @Operation(
            summary = "Отметить урок как пройденный",
            description = """
                    Сохраняет факт прохождения урока в зачислении и в той же транзакции увеличивает
                    счётчик пройденных уроков за календарный день (дата из completedAt, либо сегодня).
                    """
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Урок зафиксирован",
                    content = @Content(schema = @Schema(implementation = CompleteLessonResponse.class))
            ),
            @ApiResponse(responseCode = "404", description = "Зачисление не найдено"),
            @ApiResponse(responseCode = "400", description = "Урок уже пройден, курс не in_progress или нарушены правила домена")
    })
    @PostMapping("/complete-lesson")
    public ResponseEntity<CompleteLessonResponse> complete(@RequestBody CompleteLessonRequest request) {
        var body = enrollmentMapperQuery.toCompleteLessonResponse(
                completeLessonInteractor.execute(
                        new CompleteLessonCommand(
                                request.userId(),
                                request.courseId(),
                                request.lessonId(),
                                request.completedAt()
                        )
                )
        );
        return ResponseEntity.ok(body);
    }
}
