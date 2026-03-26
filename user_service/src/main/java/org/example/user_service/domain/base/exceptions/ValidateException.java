package org.example.user_service.domain.base.exceptions;

public class ValidateException extends BaseException {
    public ValidateException(String message) {
        super(message, 422);
    }
}
