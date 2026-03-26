package org.example.user_service.domain.user.vo;

import lombok.Getter;
import lombok.ToString;
import org.example.user_service.domain.base.BaseValueObject;
import org.example.user_service.domain.base.exceptions.ValidateException;

import java.util.List;
import java.util.Objects;

@ToString
@Getter
public class UserCurrentCourses extends BaseValueObject {

    private final List<String> currentCourses;

    public UserCurrentCourses(List<String> currentCourses) {
        this.currentCourses = Objects.isNull(currentCourses) ? null : List.copyOf(currentCourses);
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(currentCourses)) {
            throw new ValidateException("Current courses must not be null");
        }
        for (String course : currentCourses) {
            if (Objects.isNull(course) || course.isBlank()) {
                throw new ValidateException("Current courses must not contain null or blank values");
            }
        }
    }
}
