package org.example.user_service.presentation.http.v1.exception;

import org.example.user_service.domain.base.exceptions.BaseException;

public class EmptyFileException extends BaseException {
    public EmptyFileException(String message) {
        super(message, 422);
    }
}
