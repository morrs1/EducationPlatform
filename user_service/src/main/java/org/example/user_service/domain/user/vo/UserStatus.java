package org.example.user_service.domain.user.vo;

import lombok.Getter;
import lombok.ToString;
import org.example.user_service.domain.base.BaseValueObject;
import org.example.user_service.domain.base.exceptions.ValidateException;

import java.util.Objects;
import java.util.regex.Pattern;

@ToString
@Getter
public class UserStatus extends BaseValueObject {

    private static final Pattern STATUS_PATTERN =
            Pattern.compile("^[A-Z][A-Z_]{1,31}$");

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

        if (!STATUS_PATTERN.matcher(status).matches()) {
            throw new ValidateException("Status must be uppercase and may contain underscores");
        }
    }
}
