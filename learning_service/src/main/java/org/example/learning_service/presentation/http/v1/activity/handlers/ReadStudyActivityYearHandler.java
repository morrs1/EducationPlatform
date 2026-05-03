package org.example.learning_service.presentation.http.v1.activity.handlers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.learning_service.application.interactors.activity.read_activity_year.ReadStudyActivityYearInteractor;
import org.example.learning_service.presentation.http.v1.activity.dto.UserYearActivityResponse;
import org.example.learning_service.presentation.http.v1.mappers.StudyActivityMapperQuery;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/learning/activity")
@RequiredArgsConstructor
@Tag(name = "Learning activity", description = "Ежедневная активность (пройденные уроки по дням)")
public class ReadStudyActivityYearHandler {

    private final ReadStudyActivityYearInteractor readStudyActivityYearInteractor;
    private final StudyActivityMapperQuery studyActivityMapperQuery;

    @Operation(
            summary = "Активность по дням за год",
            description = """
                    Возвращает только те даты в указанном календарном году, для которых есть строки активности:
                    объект «дата yyyy-MM-dd → число завершённых уроков в этот день».
                    """
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Календарь активности за год",
                    content = @Content(schema = @Schema(implementation = UserYearActivityResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Некорректный год")
    })
    @GetMapping("/year")
    public UserYearActivityResponse read(
            @RequestParam("userId") UUID userId,
            @RequestParam("year") int year
    ) {
        return studyActivityMapperQuery.toUserYearActivityResponse(
                readStudyActivityYearInteractor.read(userId, year)
        );
    }
}
