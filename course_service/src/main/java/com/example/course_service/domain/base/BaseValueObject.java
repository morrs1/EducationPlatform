package com.example.course_service.domain.base;

import com.example.course_service.domain.base.exceptions.ValidateException;

public abstract class BaseValueObject {
    public abstract void validate() throws ValidateException;
}
