package org.example.learning_service.application.ports;

import org.example.learning_service.domain.certificate.Certificate;

import java.util.Optional;
import java.util.UUID;

public interface CertificateRepo {

    Optional<Certificate> findById(UUID id);

    boolean existsByEnrollmentId(UUID enrollmentId);

    void deleteByEnrollmentId(UUID enrollmentId);

    void save(Certificate certificate);
}
