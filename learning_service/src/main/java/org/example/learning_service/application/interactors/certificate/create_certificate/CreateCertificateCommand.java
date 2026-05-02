package org.example.learning_service.application.interactors.certificate.create_certificate;

import java.time.LocalDateTime;
import java.util.UUID;

public record CreateCertificateCommand(
        UUID enrollmentId,
        LocalDateTime issuedAt,
        String serialNo
) {
}
