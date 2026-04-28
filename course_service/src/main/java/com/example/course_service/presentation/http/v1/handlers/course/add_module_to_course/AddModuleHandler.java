package com.example.course_service.presentation.http.v1.handlers.course.add_module_to_course;

import com.example.course_service.application.interactors.course.add_module_to_course.AddModuleInteractor;
import com.example.course_service.presentation.http.v1.exceptions_handlers.ErrorResponse;
import com.example.course_service.presentation.http.v1.mappers.CourseMapperCommand;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/course")
@RequiredArgsConstructor
@Tag(name = "Courses", description = "Operations for managing courses and course structure")
public class AddModuleHandler {

    private final AddModuleInteractor interactor;
    private final CourseMapperCommand mapper;

    @Operation(
            summary = "Add module to course",
            description = "Creates a new module inside the specified course."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Module created successfully",
                    content = @Content(schema = @Schema(type = "string", format = "uuid"))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Course not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "422",
                    description = "Validation error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    @PostMapping("/{id}/module")
    public UUID add(
            @Parameter(description = "Course identifier", required = true)
            @PathVariable("id") UUID courseId,
            @RequestBody AddModuleRequest request
    ) {
        return interactor.add(mapper.toAddModuleCommand(request, courseId));
    }
}
