package org.example.learning_service.application.interactors.certificate.get_certificate;

import lombok.RequiredArgsConstructor;
import org.example.learning_service.application.exceptions.CertificateNotFoundException;
import org.example.learning_service.application.interactors.certificate.CertificateView;
import org.example.learning_service.application.ports.CertificateRepo;
import org.example.learning_service.application.ports.TransactionManager;
import org.example.learning_service.domain.certificate.Certificate;

import java.util.UUID;

@RequiredArgsConstructor
public class GetCertificateInteractor {

    private final TransactionManager transactionManager;
    private final CertificateRepo certificateRepo;

    public CertificateView execute(UUID certificateId) {
        return transactionManager.inTransaction(() -> {
            Certificate certificate = certificateRepo
                    .findById(certificateId)
                    .orElseThrow(() -> new CertificateNotFoundException(
                            "Certificate not found: id=" + certificateId));
            return new CertificateView(
                    certificate.getId(),
                    certificate.getEnrollmentId(),
                    certificate.getUserId(),
                    certificate.getCourseId(),
                    certificate.getIssuedAt(),
                    certificate.getSerialNo(),
                    certificate.getFileUrl()
            );
        });
    }
}
