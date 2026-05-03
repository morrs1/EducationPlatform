package org.example.learning_service.application.interactors.certificate.list_certificates_by_user;

import lombok.RequiredArgsConstructor;
import org.example.learning_service.application.interactors.certificate.CertificateView;
import org.example.learning_service.application.ports.CertificateRepo;
import org.example.learning_service.application.ports.TransactionManager;
import org.example.learning_service.domain.certificate.Certificate;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
public class ListCertificatesByUserInteractor {

    private final TransactionManager transactionManager;
    private final CertificateRepo certificateRepo;

    public List<CertificateView> execute(UUID userId) {
        return transactionManager.inTransaction(() ->
                certificateRepo.findByUserIdOrderByIssuedAtDesc(userId).stream()
                        .map(ListCertificatesByUserInteractor::toView)
                        .toList());
    }

    private static CertificateView toView(Certificate certificate) {
        return new CertificateView(
                certificate.getId(),
                certificate.getEnrollmentId(),
                certificate.getUserId(),
                certificate.getCourseId(),
                certificate.getIssuedAt(),
                certificate.getSerialNo(),
                certificate.getFileUrl()
        );
    }
}
