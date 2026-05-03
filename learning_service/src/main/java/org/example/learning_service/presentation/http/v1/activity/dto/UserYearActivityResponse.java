package org.example.learning_service.presentation.http.v1.activity.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.Map;
import java.util.UUID;

/**
 * Календарь активности: дата (yyyy-MM-dd) → число завершённых уроков в этот день.
 */
@Schema(description = "Активность по дням за календарный год")
public record UserYearActivityResponse(
        @Schema(description = "Пользователь")
        UUID userId,
        @Schema(description = "Календарный год")
        int year,
        @Schema(
                description = "День (ключ ISO yyyy-MM-dd) → количество пройденных уроков",
                additionalPropertiesSchema = Integer.class
        )
        Map<String, Integer> activityByDay
) {
}
