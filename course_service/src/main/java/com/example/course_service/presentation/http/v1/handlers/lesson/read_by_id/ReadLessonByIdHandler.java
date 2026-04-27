package com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id;

import com.example.course_service.application.interactors.lesson.read_lesson_by_id.ReadLessonByIdInteractor;
import com.example.course_service.presentation.http.v1.exceptions_handlers.ErrorResponse;
import com.example.course_service.presentation.http.v1.handlers.lesson.read_by_id.dto.response.ReadLessonByIdResponse;
import com.example.course_service.presentation.http.v1.mappers.LessonMapperQuery;
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
@RequestMapping("/course/lesson")
@RequiredArgsConstructor
@Tag(name = "Lessons", description = "Operations for creating lessons and managing their content")
public class ReadLessonByIdHandler {

    private final ReadLessonByIdInteractor interactor;
    private final LessonMapperQuery mapper;

    @Operation(
            summary = "Get lesson by id",
            description = "Returns lesson metadata, typed lesson content, and attached assets."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Lesson found",
                    content = @Content(schema = @Schema(implementation = ReadLessonByIdResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Lesson not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    @GetMapping("/{id}")
    public ReadLessonByIdResponse readById(
            @Parameter(description = "Lesson identifier", required = true)
            @PathVariable UUID id
    ) {
        return mapper.toReadLessonByIdResponse(interactor.readById(id));
    }
}
