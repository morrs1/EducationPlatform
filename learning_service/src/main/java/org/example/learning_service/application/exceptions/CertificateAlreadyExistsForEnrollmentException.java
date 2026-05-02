package org.example.learning_service.application.exceptions;

public class CertificateAlreadyExistsForEnrollmentException extends RuntimeException {

    public CertificateAlreadyExistsForEnrollmentException(String message) {
        super(message);
    }
}
