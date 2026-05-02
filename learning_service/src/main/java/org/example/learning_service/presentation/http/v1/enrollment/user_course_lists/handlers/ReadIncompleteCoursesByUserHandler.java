package org.example.learning_service.presentation.http.v1.enrollment.user_course_lists.handlers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.learning_service.application.interactors.enrollment.user_course_lists.ReadIncompleteCoursesByUserInteractor;
import org.example.learning_service.presentation.http.v1.enrollment.user_course_lists.dto.UserCoursesResponse;
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
public class ReadIncompleteCoursesByUserHandler {

    private final ReadIncompleteCoursesByUserInteractor readIncompleteCoursesByUserInteractor;
    private final EnrollmentMapperQuery enrollmentMapperQuery;

    @Operation(
            summary = "Непройденные курсы пользователя",
            description = """
                    Зачисления со статусом «in_progress»: курс ещё не завершён официально
                    (статус «completed» см. отдельный endpoint).
                    """
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Список сформирован (может быть пустым)",
                    content = @Content(schema = @Schema(implementation = UserCoursesResponse.class))
            )
    })
    @GetMapping("/courses/by-user/incomplete")
    public UserCoursesResponse read(@RequestParam("userId") UUID userId) {
        return enrollmentMapperQuery.toUserCoursesResponse(
                readIncompleteCoursesByUserInteractor.read(userId)
        );
    }
}
