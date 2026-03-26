package org.example.user_service.domain.user.vo;

import lombok.Getter;
import lombok.ToString;
import org.example.user_service.domain.base.BaseValueObject;
import org.example.user_service.domain.base.exceptions.ValidateException;

import java.util.regex.Pattern;

@ToString
@Getter
public class UserSurname extends BaseValueObject {

    private static final Pattern SURNAME_PATTERN =
            Pattern.compile("^\\p{L}+(?:[ '-]\\p{L}+)*$");

    private final String surname;

    public UserSurname(String surname) {
        this.surname = surname;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (surname == null) {
            throw new ValidateException("Surname must not be null");
        }
        if (surname.isBlank()) {
            throw new ValidateException("Surname must not be blank");
        }
        if (surname.length() < 2 || surname.length() > 50) {
            throw new ValidateException("Surname length must be between 2 and 50 characters");
        }
        if (!SURNAME_PATTERN.matcher(surname).matches()) {
            throw new ValidateException("Surname contains invalid characters");
        }
    }
}
