package org.example.user_service.domain.user.vo;

import lombok.Getter;
import lombok.ToString;
import org.example.user_service.domain.base.BaseValueObject;
import org.example.user_service.domain.base.exceptions.ValidateException;

import java.util.Objects;
import java.util.regex.Pattern;

@ToString
@Getter
public class UserEmail extends BaseValueObject {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private final String email;

    public UserEmail(String email) {
        this.email = email;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(email)) {
            throw new ValidateException("Email must not be null");
        }
        if (email.isBlank()) {
            throw new ValidateException("Email must not be blank");
        }
        if (email.length() > 254) {
            throw new ValidateException("Email length must not exceed 254 characters");
        }
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new ValidateException("Email has invalid format");
        }
    }
}
