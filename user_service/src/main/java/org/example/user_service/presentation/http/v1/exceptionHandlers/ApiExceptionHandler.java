package org.example.user_service.presentation.http.v1.exceptionHandlers;

import org.example.user_service.domain.base.exceptions.BaseException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler
    public ResponseEntity<ErrorResponse> handleException(BaseException exception) {
        return ResponseEntity.status(exception.getHttpCode()).body(new ErrorResponse(exception.getMessage()));
    }
}
