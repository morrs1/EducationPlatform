package com.example.course_service.presentation.http.v1.handlers.course.read_by_id;

import com.example.course_service.application.interactors.course.read_course_by_id.ReadCourseByIdInteractor;
import com.example.course_service.presentation.http.v1.exceptions_handlers.ErrorResponse;
import com.example.course_service.presentation.http.v1.handlers.course.read_by_id.dto.response.ReadCourseByIdResponse;
import com.example.course_service.presentation.http.v1.mappers.CourseMapperQuery;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/course")
@RequiredArgsConstructor
@Tag(name = "Courses", description = "Operations for managing courses and course structure")
public class ReadCourseByIdHandler {

    private final ReadCourseByIdInteractor interactor;
    private final CourseMapperQuery mapper;

    @Operation(
            summary = "Get course by id",
            description = "Returns course metadata together with flattened module and lesson preview structure."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Course found",
                    content = @Content(schema = @Schema(implementation = ReadCourseByIdResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Course not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    @GetMapping("{id}")
    public ReadCourseByIdResponse readById(
            @Parameter(description = "Course identifier", required = true)
            @PathVariable UUID id
    ) {
        return mapper.toReadCourseByIdResponse(interactor.readById(id));
    }
}
