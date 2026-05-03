package com.example.course_service.presentation.http.v1.handlers.course.publish_course;

import com.example.course_service.application.interactors.course.publish_course.PublishCourseInteractor;
import com.example.course_service.presentation.http.v1.exceptions_handlers.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/course")
@RequiredArgsConstructor
@Tag(name = "Courses", description = "Operations for managing courses and course structure")
public class PublishCourseHandler {

    private final PublishCourseInteractor interactor;

    @Operation(
            summary = "Publish course",
            description = "Sets is_preview to true so the course is treated as published (visible in catalog flows)."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Course published"),
            @ApiResponse(
                    responseCode = "404",
                    description = "Course not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    @PatchMapping("{id}/publish")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void publish(
            @Parameter(description = "Course identifier", required = true)
            @PathVariable UUID id
    ) {
        interactor.publish(id);
    }
}
