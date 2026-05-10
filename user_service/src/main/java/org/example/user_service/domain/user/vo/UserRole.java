package org.example.user_service.domain.user.vo;

import lombok.Getter;
import lombok.ToString;
import org.example.user_service.domain.base.BaseValueObject;
import org.example.user_service.domain.base.exceptions.ValidateException;

import java.util.Set;

@ToString
@Getter
public class UserRole extends BaseValueObject {

    public static final String DEFAULT = "USER";
    public static final String AUTHOR = "AUTHOR";
    public static final String ADMIN = "ADMIN";

    private static final Set<String> ALLOWED = Set.of(DEFAULT, ADMIN, AUTHOR);

    private final String role;

    public UserRole(String role) {
        this.role = role == null || role.isBlank() ? DEFAULT : role.trim().toUpperCase();
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (!ALLOWED.contains(role)) {
            throw new ValidateException("Unsupported user role: " + role);
        }
    }
}
