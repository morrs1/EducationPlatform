package org.example.user_service.domain.user.vo;

import lombok.Getter;
import lombok.ToString;
import org.example.user_service.domain.base.BaseValueObject;
import org.example.user_service.domain.base.exceptions.ValidateException;

import java.util.Objects;

@ToString
@Getter
public class UserFinishedCourse extends BaseValueObject {

    private final String finishedCourse;

    public UserFinishedCourse(String finishedCourse) {
        this.finishedCourse = finishedCourse;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(finishedCourse) || finishedCourse.isBlank()) {
            throw new ValidateException("Finished course must not be null or blank");
        }
    }
}
