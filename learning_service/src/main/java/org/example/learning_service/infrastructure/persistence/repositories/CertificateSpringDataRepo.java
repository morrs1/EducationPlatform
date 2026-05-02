package org.example.learning_service.infrastructure.persistence.repositories;

import org.example.learning_service.infrastructure.persistence.models.certificate.HibernateCertificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CertificateSpringDataRepo extends JpaRepository<HibernateCertificate, UUID> {

    boolean existsByEnrollmentId(UUID enrollmentId);
}
