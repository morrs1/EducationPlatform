package com.example.course_service.presentation.http.v1.handlers.course.read_all;

import com.example.course_service.application.interactors.course.read_all.ReadAllCoursesInteractor;
import com.example.course_service.presentation.http.v1.handlers.course.read_by_id.dto.response.ReadCourseByIdResponse;
import com.example.course_service.presentation.http.v1.mappers.CourseMapperQuery;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/course")
@RequiredArgsConstructor
@Tag(name = "Courses", description = "Operations for managing courses and course structure")
public class ReadAllCoursesHandler {

    private final ReadAllCoursesInteractor interactor;
    private final CourseMapperQuery mapper;

    @Operation(
            summary = "Get all courses",
            description = "Returns all courses with flattened module and lesson preview structure."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Courses loaded successfully",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = ReadCourseByIdResponse.class)))
            )
    })
    @GetMapping
    public List<ReadCourseByIdResponse> readAll() {
        return mapper.toReadCourseByIdResponses(interactor.readAll());
    }
}
