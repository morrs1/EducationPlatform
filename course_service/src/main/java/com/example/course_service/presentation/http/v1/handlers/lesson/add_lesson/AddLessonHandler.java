package com.example.course_service.presentation.http.v1.handlers.lesson.add_lesson;

import com.example.course_service.application.interactors.lesson.add_lesson.AddLessonInteractor;
import com.example.course_service.presentation.http.v1.exceptions_handlers.ErrorResponse;
import com.example.course_service.presentation.http.v1.mappers.LessonMapperCommand;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/course/lesson")
@RequiredArgsConstructor
@Tag(name = "Lessons", description = "Operations for creating lessons and managing their content")
public class AddLessonHandler {

    private final AddLessonInteractor interactor;
    private final LessonMapperCommand mapper;

    @Operation(
            summary = "Create lesson",
            description = "Creates a lesson in the lesson domain and adds its preview into the specified course module."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Lesson created successfully",
                    content = @Content(schema = @Schema(type = "string", format = "uuid"))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Course or module not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "422",
                    description = "Validation error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    @PostMapping
    public UUID add(@RequestBody AddLessonRequest request) {
        return interactor.add(mapper.toAddLessonCommand(request));
    }
}
