package com.example.course_service.presentation.http.v1.exceptions;

import com.example.course_service.domain.base.exceptions.BaseException;

public class EmptyFileException extends BaseException {
    public EmptyFileException(String message) {
        super(message, 422);
    }
}
