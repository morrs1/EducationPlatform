package org.example.learning_service.application.interactors.activity.read_activity_year;

import lombok.RequiredArgsConstructor;
import org.example.learning_service.application.ports.StudyActivityRepo;
import org.example.learning_service.application.ports.TransactionManager;
import org.example.learning_service.domain.activity.UserStudyDay;
import org.example.learning_service.domain.base.exceptions.ValidateException;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RequiredArgsConstructor
public class ReadStudyActivityYearInteractor {

    private final TransactionManager transactionManager;
    private final StudyActivityRepo studyActivityRepo;

    public ReadStudyActivityYearView read(UUID userId, int year) throws ValidateException {
        if (year < 1970 || year > 2125) {
            throw new ValidateException("year must be between 1970 and 2125");
        }
        LocalDate from = LocalDate.of(year, 1, 1);
        LocalDate to = LocalDate.of(year, 12, 31);
        return transactionManager.inTransaction(() -> {
            List<UserStudyDay> rows =
                    studyActivityRepo.findByUserIdAndActivityDateBetween(userId, from, to);
            Map<String, Integer> byDay = new LinkedHashMap<>();
            for (UserStudyDay row : rows) {
                byDay.put(row.getActivityDate().toString(), row.getLessonsCompletedCount());
            }
            return new ReadStudyActivityYearView(userId, year, byDay);
        });
    }
}
