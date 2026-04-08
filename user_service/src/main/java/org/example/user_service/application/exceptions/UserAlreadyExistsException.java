package org.example.user_service.application.exceptions;

import org.example.user_service.domain.base.exceptions.BaseException;

public class UserAlreadyExistsException extends BaseException {
    public UserAlreadyExistsException(String message) {
        super(message, 409);
    }
}
