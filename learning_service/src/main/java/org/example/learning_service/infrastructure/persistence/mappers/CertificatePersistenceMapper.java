package org.example.learning_service.infrastructure.persistence.mappers;

import org.example.learning_service.domain.certificate.Certificate;
import org.example.learning_service.infrastructure.persistence.models.certificate.HibernateCertificate;
import org.springframework.stereotype.Component;

@Component
public class CertificatePersistenceMapper {

    public Certificate toDomain(HibernateCertificate entity) {
        return new Certificate(
                entity.getId(),
                entity.getEnrollmentId(),
                entity.getUserId(),
                entity.getCourseId(),
                entity.getIssuedAt(),
                entity.getSerialNo(),
                entity.getFileUrl()
        );
    }

    public HibernateCertificate toEntityForInsert(Certificate domain) {
        HibernateCertificate entity = new HibernateCertificate();
        entity.setId(domain.getId());
        entity.setEnrollmentId(domain.getEnrollmentId());
        entity.setUserId(domain.getUserId());
        entity.setCourseId(domain.getCourseId());
        entity.setIssuedAt(domain.getIssuedAt());
        entity.setSerialNo(domain.getSerialNo());
        entity.setFileUrl(domain.getFileUrl());
        return entity;
    }

    public void applyDomainToManaged(HibernateCertificate managed, Certificate domain) {
        managed.setEnrollmentId(domain.getEnrollmentId());
        managed.setUserId(domain.getUserId());
        managed.setCourseId(domain.getCourseId());
        managed.setIssuedAt(domain.getIssuedAt());
        managed.setSerialNo(domain.getSerialNo());
        managed.setFileUrl(domain.getFileUrl());
    }
}
