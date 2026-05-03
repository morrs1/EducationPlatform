package org.example.learning_service.application.interactors.activity.read_activity_year;

import java.util.Map;
import java.util.UUID;

/**
 * @param activityByDay ключ — ISO-8601 календарная дата (yyyy-MM-dd), значение — число пройденных уроков за день.
 */
public record ReadStudyActivityYearView(
        UUID userId,
        int year,
        Map<String, Integer> activityByDay
) {
}
