package com.example.course_service.application.exceptions;

import com.example.course_service.domain.base.exceptions.BaseException;

public class LessonNotFoundException extends BaseException {
    public LessonNotFoundException(String message) {
        super(message, 404);
    }
}
