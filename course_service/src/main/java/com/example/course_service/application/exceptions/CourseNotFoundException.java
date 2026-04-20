package com.example.course_service.application.exceptions;

import com.example.course_service.domain.base.exceptions.BaseException;

public class CourseNotFoundException extends BaseException {
    public CourseNotFoundException(String message) {
        super(message, 404);
    }
}
