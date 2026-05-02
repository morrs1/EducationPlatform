package org.example.learning_service.infrastructure.adapters.persistence;

import lombok.RequiredArgsConstructor;
import org.example.learning_service.application.ports.CertificateRepo;
import org.example.learning_service.domain.certificate.Certificate;
import org.example.learning_service.infrastructure.persistence.mappers.CertificatePersistenceMapper;
import org.example.learning_service.infrastructure.persistence.repositories.CertificateSpringDataRepo;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CertificateRepoJpaAdapter implements CertificateRepo {

    private final CertificateSpringDataRepo certificateSpringDataRepo;
    private final CertificatePersistenceMapper certificatePersistenceMapper;

    @Override
    public Optional<Certificate> findById(UUID id) {
        return certificateSpringDataRepo.findById(id).map(certificatePersistenceMapper::toDomain);
    }

    @Override
    public boolean existsByEnrollmentId(UUID enrollmentId) {
        return certificateSpringDataRepo.existsByEnrollmentId(enrollmentId);
    }

    @Override
    public void save(Certificate certificate) {
        var existing = certificateSpringDataRepo.findById(certificate.getId());
        if (existing.isPresent()) {
            certificatePersistenceMapper.applyDomainToManaged(existing.get(), certificate);
            certificateSpringDataRepo.save(existing.get());
        } else {
            certificateSpringDataRepo.save(certificatePersistenceMapper.toEntityForInsert(certificate));
        }
    }
}
