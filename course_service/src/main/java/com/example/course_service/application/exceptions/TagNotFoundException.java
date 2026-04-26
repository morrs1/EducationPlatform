package com.example.course_service.application.exceptions;

import com.example.course_service.domain.base.exceptions.BaseException;

public class TagNotFoundException extends BaseException {
    public TagNotFoundException(String message) {
        super(message, 404);
    }
}
