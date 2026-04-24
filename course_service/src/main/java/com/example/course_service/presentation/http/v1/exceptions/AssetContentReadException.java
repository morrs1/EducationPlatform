package com.example.course_service.presentation.http.v1.exceptions;

import com.example.course_service.domain.base.exceptions.BaseException;

public class AssetContentReadException extends BaseException {
    public AssetContentReadException(String message) {
        super(message, 500);
    }
}
