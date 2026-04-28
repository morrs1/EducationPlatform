package com.example.course_service.application.exceptions;

import com.example.course_service.domain.base.exceptions.BaseException;

public class InvalidLessonContentException extends BaseException {
    public InvalidLessonContentException(String message) {
        super(message, 422);
    }
}
