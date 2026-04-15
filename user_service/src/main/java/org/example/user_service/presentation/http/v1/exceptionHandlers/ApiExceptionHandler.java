package org.example.user_service.presentation.http.v1.exceptionHandlers;

import org.example.user_service.domain.base.exceptions.BaseException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler
    public ResponseEntity<ErrorResponse> handleException(BaseException exception) {
        return ResponseEntity.status(exception.getHttpCode()).body(new ErrorResponse(exception.getMessage()));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException exception) {
        return ResponseEntity.status(413).body(new ErrorResponse("File is too large"));
    }

}
