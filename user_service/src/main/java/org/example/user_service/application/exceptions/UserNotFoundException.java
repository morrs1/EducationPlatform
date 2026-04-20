package org.example.user_service.application.exceptions;

import org.example.user_service.domain.base.exceptions.BaseException;

public class UserNotFoundException extends BaseException {
    public UserNotFoundException(String message) {
        super(message, 404);
    }
}
