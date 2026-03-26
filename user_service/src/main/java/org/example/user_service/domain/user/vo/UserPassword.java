package org.example.user_service.domain.user.vo;

import lombok.Getter;
import lombok.ToString;
import org.example.user_service.domain.base.BaseValueObject;
import org.example.user_service.domain.base.exceptions.ValidateException;

import java.util.Objects;
import java.util.regex.Pattern;

@ToString
@Getter
public class UserPassword extends BaseValueObject {

    private static final Pattern PASSWORD_PATTERN =
            Pattern.compile("^(?=.*[A-Za-z])(?=.*\\d).{8,128}$");

    private final String password;

    public UserPassword(String password) {
        this.password = password;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(password)) {
            throw new ValidateException("Password must not be null");
        }
        if (password.isBlank()) {
            throw new ValidateException("Password must not be blank");
        }
        if (!PASSWORD_PATTERN.matcher(password).matches()) {
            throw new ValidateException("Password must be 8-128 characters long and contain letters and digits");
        }
    }
}
