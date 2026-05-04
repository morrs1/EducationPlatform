package com.example.course_service.presentation.http.v1.handlers.course.search_courses;

import com.example.course_service.application.interactors.course.search_courses.SearchCoursesInteractor;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/course")
@RequiredArgsConstructor
@Tag(name = "Courses", description = "Operations for managing courses and course structure")
public class SearchCoursesHandler {

    private final SearchCoursesInteractor interactor;
    private final CourseMapperQuery mapper;

    @Operation(
            summary = "Search courses by title (full-text)",
            description = """
                    PostgreSQL full-text search over generated fts_vector (simple config), published courses only.
                    Empty or blank q returns an empty list.
                    """
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Matching courses in relevance order",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = ReadCourseByIdResponse.class)))
            )
    })
    @GetMapping("search")
    public List<ReadCourseByIdResponse> search(
            @Parameter(description = "Search text (matched against course title via fts_vector / simple config)")
            @RequestParam(value = "q", defaultValue = "") String q
    ) {
        return mapper.toReadCourseByIdResponses(interactor.search(q));
    }
}
