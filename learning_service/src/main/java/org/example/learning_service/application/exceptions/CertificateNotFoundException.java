package org.example.learning_service.application.exceptions;

public class CertificateNotFoundException extends RuntimeException {

    public CertificateNotFoundException(String message) {
        super(message);
    }
}
