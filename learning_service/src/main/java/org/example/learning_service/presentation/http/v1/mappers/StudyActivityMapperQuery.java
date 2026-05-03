package org.example.learning_service.presentation.http.v1.mappers;

import org.example.learning_service.application.interactors.activity.read_activity_year.ReadStudyActivityYearView;
import org.example.learning_service.presentation.http.v1.activity.dto.UserYearActivityResponse;
import org.springframework.stereotype.Component;

@Component
public class StudyActivityMapperQuery {

    public UserYearActivityResponse toUserYearActivityResponse(ReadStudyActivityYearView view) {
        return new UserYearActivityResponse(view.userId(), view.year(), view.activityByDay());
    }
}
