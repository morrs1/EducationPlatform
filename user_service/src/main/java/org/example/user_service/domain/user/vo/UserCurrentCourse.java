package org.example.user_service.domain.user.vo;

import lombok.Getter;
import lombok.ToString;
import org.example.user_service.domain.base.BaseValueObject;
import org.example.user_service.domain.base.exceptions.ValidateException;

import java.util.Objects;
import java.util.UUID;

@ToString
@Getter
public class UserCurrentCourse extends BaseValueObject {

    private final UUID currentCourse;

    public UserCurrentCourse(UUID currentCourse) {
        this.currentCourse = currentCourse;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(currentCourse)) {
            throw new ValidateException("Current course must not be null");
        }
    }
}
