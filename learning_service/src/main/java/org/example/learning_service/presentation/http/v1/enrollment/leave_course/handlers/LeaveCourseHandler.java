package org.example.learning_service.presentation.http.v1.enrollment.leave_course.handlers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.learning_service.application.interactors.enrollment.leave_course.LeaveCourseCommand;
import org.example.learning_service.application.interactors.enrollment.leave_course.LeaveCourseInteractor;
import org.example.learning_service.presentation.http.v1.enrollment.leave_course.dto.LeaveCourseRequest;
import org.example.learning_service.presentation.http.v1.exception_handlers.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/learning/enrollment")
@RequiredArgsConstructor
@Tag(name = "Learning enrollment", description = "Зачисление и прогресс по курсам")
public class LeaveCourseHandler {

    private final LeaveCourseInteractor leaveCourseInteractor;

    @Operation(
            summary = "Покинуть курс",
            description = """
                    Удаляет зачисление и все связанные прохождения уроков (lesson_completion),
                    при наличии сертификата — тоже удаляет его. В той же транзакции уменьшает
                    счётчики дневной активности (user_activity_day) по датам завершённых уроков.
                    """
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Курс покинут"),
            @ApiResponse(
                    responseCode = "404",
                    description = "Зачисление не найдено",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    @PostMapping("/leave")
    public ResponseEntity<Void> leave(@RequestBody LeaveCourseRequest request) {
        leaveCourseInteractor.execute(new LeaveCourseCommand(request.userId(), request.courseId()));
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
