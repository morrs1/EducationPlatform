package org.example.user_service.domain.user.vo;

import lombok.Getter;
import lombok.ToString;
import org.example.user_service.domain.base.BaseValueObject;
import org.example.user_service.domain.base.exceptions.ValidateException;

import java.util.Objects;
import java.util.regex.Pattern;

@ToString
@Getter
public class UserPatronymic extends BaseValueObject {

    private static final Pattern PATRONYMIC_PATTERN =
            Pattern.compile("^\\p{L}+(?:[ '-]\\p{L}+)*$");

    private final String patronymic;

    public UserPatronymic(String patronymic) {
        this.patronymic = patronymic;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(patronymic)) {
            throw new ValidateException("Patronymic must not be null");
        }
        if (patronymic.isBlank()) {
            throw new ValidateException("Patronymic must not be blank");
        }
        if (patronymic.length() < 2 || patronymic.length() > 50) {
            throw new ValidateException("Patronymic length must be between 2 and 50 characters");
        }
        if (!PATRONYMIC_PATTERN.matcher(patronymic).matches()) {
            throw new ValidateException("Patronymic contains invalid characters");
        }
    }
}
