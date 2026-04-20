package org.example.user_service.domain.user.vo;

import lombok.Getter;
import lombok.ToString;
import org.example.user_service.domain.base.BaseValueObject;
import org.example.user_service.domain.base.exceptions.ValidateException;

import java.util.Objects;
import java.util.UUID;

@ToString
@Getter
public class UserFinishedCourse extends BaseValueObject {

    private final UUID finishedCourse;

    public UserFinishedCourse(UUID finishedCourse) {
        this.finishedCourse = finishedCourse;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(finishedCourse)) {
            throw new ValidateException("Finished course must not be null");
        }
    }
}
