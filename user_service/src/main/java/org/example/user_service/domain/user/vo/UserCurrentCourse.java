package org.example.user_service.domain.user.vo;

import lombok.Getter;
import lombok.ToString;
import org.example.user_service.domain.base.BaseValueObject;
import org.example.user_service.domain.base.exceptions.ValidateException;

import java.util.Objects;

@ToString
@Getter
public class UserCurrentCourse extends BaseValueObject {

    private final String currentCourse;

    public UserCurrentCourse(String currentCourse) {
        this.currentCourse = currentCourse;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(currentCourse) || currentCourse.isBlank()) {
            throw new ValidateException("Current course must not be null or blank");
        }
    }
}
