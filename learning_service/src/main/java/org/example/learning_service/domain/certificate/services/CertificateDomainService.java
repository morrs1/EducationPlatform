package org.example.learning_service.domain.certificate.services;

import org.example.learning_service.domain.base.BaseDomainService;
import org.example.learning_service.domain.base.exceptions.ValidateException;
import org.example.learning_service.domain.certificate.Certificate;

import java.util.Objects;

public class CertificateDomainService extends BaseDomainService {

    public void attachFileUrl(Certificate certificate, String fileUrl) throws ValidateException {
        Objects.requireNonNull(certificate);
        if (fileUrl == null || fileUrl.isBlank()) {
            throw new ValidateException("Certificate file URL must not be blank");
        }
        if (fileUrl.length() > 1024) {
            throw new ValidateException("Certificate file URL must not exceed 1024 characters");
        }
        certificate.setFileUrl(fileUrl.trim());
    }
}
