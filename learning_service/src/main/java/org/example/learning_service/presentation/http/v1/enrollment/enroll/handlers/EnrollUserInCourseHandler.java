package org.example.learning_service.presentation.http.v1.enrollment.enroll.handlers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.learning_service.application.interactors.enrollment.enroll_user_in_course.EnrollUserInCourseCommand;
import org.example.learning_service.application.interactors.enrollment.enroll_user_in_course.EnrollUserInCourseInteractor;
import org.example.learning_service.presentation.http.v1.enrollment.enroll.dto.EnrollUserInCourseRequest;
import org.example.learning_service.presentation.http.v1.enrollment.enroll.dto.EnrollUserInCourseResponse;
import org.example.learning_service.presentation.http.v1.mappers.EnrollmentMapperQuery;
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
public class EnrollUserInCourseHandler {

    private final EnrollUserInCourseInteractor enrollUserInCourseInteractor;
    private final EnrollmentMapperQuery enrollmentMapperQuery;

    @Operation(
            summary = "Записать пользователя на курс",
            description = """
                    Создаёт зачисление со статусом «in_progress».
                    Повторная запись той же пары пользователь + курс отклоняется с 409.
                    """
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Зачисление создано",
                    content = @Content(schema = @Schema(implementation = EnrollUserInCourseResponse.class))
            ),
            @ApiResponse(responseCode = "409", description = "Пользователь уже записан на этот курс")
    })
    @PostMapping
    public ResponseEntity<EnrollUserInCourseResponse> enroll(@RequestBody EnrollUserInCourseRequest request) {
        EnrollUserInCourseResponse body = enrollmentMapperQuery.toEnrollUserInCourseResponse(
                enrollUserInCourseInteractor.execute(new EnrollUserInCourseCommand(request.userId(), request.courseId()))
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }
}
