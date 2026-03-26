package org.example.user_service.domain.user.vo;

import lombok.Getter;
import lombok.ToString;
import org.example.user_service.domain.base.BaseValueObject;
import org.example.user_service.domain.base.exceptions.ValidateException;

import java.util.List;
import java.util.Objects;

@ToString
@Getter
public class UserFinishedCourses extends BaseValueObject {

    private final List<String> finishedCourses;

    public UserFinishedCourses(List<String> finishedCourses) {
        this.finishedCourses = Objects.isNull(finishedCourses) ? null : List.copyOf(finishedCourses);
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(finishedCourses)) {
            throw new ValidateException("Finished courses must not be null");
        }
        for (String course : finishedCourses) {
            if (Objects.isNull(course) || course.isBlank()) {
                throw new ValidateException("Finished courses must not contain null or blank values");
            }
        }
    }
}
