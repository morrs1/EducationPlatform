package org.example.user_service.domain.user.vo;

import lombok.Getter;
import lombok.ToString;
import org.example.user_service.domain.base.BaseValueObject;
import org.example.user_service.domain.base.exceptions.ValidateException;

import java.util.Objects;

@ToString
@Getter
public class UserStatus extends BaseValueObject {

    private final String status;

    public UserStatus(String status) {
        this.status = status;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(status)) {
            throw new ValidateException("Status must not be null");
        }

    }
}
