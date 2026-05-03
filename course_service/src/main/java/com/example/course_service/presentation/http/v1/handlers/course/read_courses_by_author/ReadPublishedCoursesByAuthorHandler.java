package com.example.course_service.presentation.http.v1.handlers.course.read_courses_by_author;

import com.example.course_service.application.interactors.course.read_courses_by_author.ReadPublishedCoursesByAuthorInteractor;
import com.example.course_service.presentation.http.v1.handlers.course.read_by_id.dto.response.ReadCourseByIdResponse;
import com.example.course_service.presentation.http.v1.mappers.CourseMapperQuery;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/course")
@RequiredArgsConstructor
@Tag(name = "Courses", description = "Operations for managing courses and course structure")
public class ReadPublishedCoursesByAuthorHandler {

    private final ReadPublishedCoursesByAuthorInteractor interactor;
    private final CourseMapperQuery mapper;

    @Operation(
            summary = "List published courses by author",
            description = "Returns courses for this author where is_preview is true (published / visible)."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Published courses",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = ReadCourseByIdResponse.class)))
            )
    })
    @GetMapping("by-author/{authorId}/published")
    public List<ReadCourseByIdResponse> readPublished(
            @Parameter(description = "Author (user) identifier", required = true)
            @PathVariable UUID authorId
    ) {
        return mapper.toReadCourseByIdResponses(interactor.read(authorId));
    }
}
