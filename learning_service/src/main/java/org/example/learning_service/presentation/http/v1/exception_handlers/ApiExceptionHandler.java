package org.example.learning_service.presentation.http.v1.exception_handlers;

import org.example.learning_service.application.exceptions.CertificateAlreadyExistsForEnrollmentException;
import org.example.learning_service.application.exceptions.CertificateNotFoundException;
import org.example.learning_service.application.exceptions.EnrollmentAlreadyExistsException;
import org.example.learning_service.application.exceptions.EnrollmentNotFoundException;
import org.example.learning_service.domain.base.exceptions.ValidateException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(EnrollmentNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEnrollmentNotFound(EnrollmentNotFoundException exception) {
        return ResponseEntity.status(404).body(new ErrorResponse(exception.getMessage()));
    }

    @ExceptionHandler(EnrollmentAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleEnrollmentAlreadyExists(EnrollmentAlreadyExistsException exception) {
        return ResponseEntity.status(409).body(new ErrorResponse(exception.getMessage()));
    }

    @ExceptionHandler(CertificateNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleCertificateNotFound(CertificateNotFoundException exception) {
        return ResponseEntity.status(404).body(new ErrorResponse(exception.getMessage()));
    }

    @ExceptionHandler(CertificateAlreadyExistsForEnrollmentException.class)
    public ResponseEntity<ErrorResponse> handleCertificateAlreadyExistsForEnrollment(
            CertificateAlreadyExistsForEnrollmentException exception) {
        return ResponseEntity.status(409).body(new ErrorResponse(exception.getMessage()));
    }

    @ExceptionHandler(ValidateException.class)
    public ResponseEntity<ErrorResponse> handleValidate(ValidateException exception) {
        return ResponseEntity.status(400).body(new ErrorResponse(exception.getMessage()));
    }
}
