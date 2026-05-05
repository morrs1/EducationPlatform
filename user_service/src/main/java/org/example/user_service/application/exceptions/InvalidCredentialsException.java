package org.example.user_service.application.exceptions;

import org.example.user_service.domain.base.exceptions.BaseException;

public class InvalidCredentialsException extends BaseException {

    public InvalidCredentialsException(String message) {
        super(message, 401);
    }
}
