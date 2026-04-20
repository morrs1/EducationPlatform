package org.example.user_service.domain.user.vo;

import lombok.Getter;
import lombok.ToString;
import org.example.user_service.domain.base.BaseValueObject;
import org.example.user_service.domain.base.exceptions.ValidateException;

import java.util.Objects;
import java.util.regex.Pattern;

@ToString
@Getter
public class UserName extends BaseValueObject {

    private static final Pattern NAME_PATTERN =
            Pattern.compile("^\\p{L}+(?:[ '-]\\p{L}+)*$");

    private final String name;

    public UserName(String name) {
        this.name = name;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(name)) {
            throw new ValidateException("Name must not be null");
        }
        if (name.isBlank()) {
            throw new ValidateException("Name must not be blank");
        }
        if (name.length() < 2 || name.length() > 50) {
            throw new ValidateException("Name length must be between 2 and 50 characters");
        }
        if (!NAME_PATTERN.matcher(name).matches()) {
            throw new ValidateException("Name contains invalid characters");
        }
    }
}
