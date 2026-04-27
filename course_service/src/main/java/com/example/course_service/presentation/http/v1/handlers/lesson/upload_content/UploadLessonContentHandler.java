package com.example.course_service.presentation.http.v1.handlers.lesson.upload_content;

import com.example.course_service.application.interactors.lesson.upload_content.UploadLessonContentInteractor;
import com.example.course_service.presentation.http.v1.exceptions_handlers.ErrorResponse;
import com.example.course_service.presentation.http.v1.mappers.LessonMapperCommand;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/course/lesson")
@RequiredArgsConstructor
@Tag(name = "Lessons", description = "Operations for creating lessons and managing their content")
public class UploadLessonContentHandler {

    private final UploadLessonContentInteractor interactor;
    private final LessonMapperCommand mapper;


    @Operation(
            summary = "Upload lesson content",
            description = "Updates lesson content. The JSON structure of `content` depends on the saved lesson type: `theory`, `quiz`, or `coding`."
    )
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            description = "Lesson content payload. The `content` object shape must match the type of the target lesson.",
            content = @Content(
                    mediaType = MediaType.APPLICATION_JSON_VALUE,
                    schema = @Schema(implementation = UploadLessonContentRequest.class),
                    examples = {
                            @ExampleObject(
                                    name = "Theory lesson",
                                    summary = "Markdown content for theory lesson",
                                    value = """
                                            {
                                              "content": {
                                                "markdown": "# Variables\\nTheory lesson body"
                                              }
                                            }
                                            """
                            ),
                            @ExampleObject(
                                    name = "Quiz lesson",
                                    summary = "Intro markdown and quiz questions",
                                    value = """
                                            {
                                              "content": {
                                                "introMarkdown": "## Answer the questions",
                                                "questions": [
                                                  {
                                                    "id": "11111111-1111-1111-1111-111111111111",
                                                    "type": "single_choice",
                                                    "text": "What is Java?",
                                                    "options": [
                                                      {
                                                        "id": "22222222-2222-2222-2222-222222222222",
                                                        "text": "Programming language",
                                                        "isCorrect": true
                                                      },
                                                      {
                                                        "id": "33333333-3333-3333-3333-333333333333",
                                                        "text": "Database",
                                                        "isCorrect": false
                                                      }
                                                    ]
                                                  }
                                                ]
                                              }
                                            }
                                            """
                            ),
                            @ExampleObject(
                                    name = "Coding lesson",
                                    summary = "Task markdown, language templates and test cases",
                                    value = """
                                            {
                                              "content": {
                                                "taskMarkdown": "## Implement sum",
                                                "checkerType": "stdin_stdout",
                                                "languages": [
                                                  {
                                                    "language": "java",
                                                    "starterCode": "class Main { public static void main(String[] args) {} }"
                                                  }
                                                ],
                                                "testCases": [
                                                  {
                                                    "id": "44444444-4444-4444-4444-444444444444",
                                                    "isPublic": true,
                                                    "input": "1 2",
                                                    "expectedOutput": "3"
                                                  }
                                                ]
                                              }
                                            }
                                            """
                            )
                    }
            )
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Lesson content uploaded successfully",
                    content = @Content(schema = @Schema(type = "string", example = "Lesson content uploaded successfully"))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Lesson not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "422",
                    description = "Validation error or content structure does not match lesson type",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    @PatchMapping("/{id}")
    public ResponseEntity<String> uploadContent(
            @Parameter(description = "Lesson identifier", required = true)
            @PathVariable("id") UUID lessonId,
            @Valid @RequestBody UploadLessonContentRequest request
    ) {
        interactor.uploadContent(mapper.toUploadLessonContentCommand(request, lessonId));
        return ResponseEntity.ok("Lesson content uploaded successfully");
    }

}
