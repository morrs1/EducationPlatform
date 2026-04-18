package com.example.course_service.domain.base.exceptions;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class BaseException extends RuntimeException {
    private int httpCode;

    public BaseException(String message, int httpCode) {
        super(message);
        this.httpCode = httpCode;
    }
}
