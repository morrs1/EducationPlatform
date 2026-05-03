package org.example.learning_service.application.interactors.certificate;

import java.time.LocalDateTime;
import java.util.UUID;

public record CertificateView(
        UUID id,
        UUID enrollmentId,
        UUID userId,
        UUID courseId,
        LocalDateTime issuedAt,
        String serialNo,
        String fileUrl
) {
}
