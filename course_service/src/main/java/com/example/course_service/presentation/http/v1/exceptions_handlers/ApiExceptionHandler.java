package com.example.course_service.presentation.http.v1.exceptions_handlers;

import com.example.course_service.domain.base.exceptions.BaseException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler
    public ResponseEntity<ErrorResponse> handleBaseException(BaseException exception) {
        return ResponseEntity.status(exception.getHttpCode()).body(new ErrorResponse(exception.getMessage()));
    }

}
