package com.example.course_service.presentation.http.v1.handlers.course.add_course;

import com.example.course_service.application.interactors.course.add_course.AddCourseInteractor;
import com.example.course_service.presentation.http.v1.exceptions_handlers.ErrorResponse;
import com.example.course_service.presentation.http.v1.mappers.CourseMapperCommand;
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
@RequestMapping("/course")
@RequiredArgsConstructor
@Tag(name = "Courses", description = "Operations for managing courses and course structure")
public class AddCourseHandler {

    private final AddCourseInteractor courseInteractor;
    private final CourseMapperCommand mapper;

    @Operation(
            summary = "Create course",
            description = "Creates a new course with metadata and optional tag references."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Course created successfully",
                    content = @Content(schema = @Schema(type = "string", format = "uuid"))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Referenced tag was not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "422",
                    description = "Validation error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    @PostMapping
    public UUID add(@RequestBody AddCourseRequest request) {
        return courseInteractor.add(mapper.toAddCourseCommand(request));
    }
}
