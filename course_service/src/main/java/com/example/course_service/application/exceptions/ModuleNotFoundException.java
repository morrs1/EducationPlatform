package com.example.course_service.application.exceptions;

import com.example.course_service.domain.base.exceptions.BaseException;

public class ModuleNotFoundException extends BaseException {
    public ModuleNotFoundException(String message) {
        super(message, 404);
    }
}
