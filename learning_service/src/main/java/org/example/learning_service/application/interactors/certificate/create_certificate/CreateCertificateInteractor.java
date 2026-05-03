package org.example.learning_service.application.interactors.certificate.create_certificate;

import lombok.RequiredArgsConstructor;
import org.example.learning_service.application.certificate.CertificateStubS3Url;
import org.example.learning_service.application.exceptions.CertificateAlreadyExistsForEnrollmentException;
import org.example.learning_service.application.exceptions.EnrollmentNotFoundException;
import org.example.learning_service.application.interactors.certificate.CertificateView;
import org.example.learning_service.application.ports.CertificateRepo;
import org.example.learning_service.application.ports.EnrollmentRepo;
import org.example.learning_service.application.ports.TransactionManager;
import org.example.learning_service.domain.base.exceptions.ValidateException;
import org.example.learning_service.domain.certificate.Certificate;
import org.example.learning_service.domain.certificate.services.CertificateDomainService;
import org.example.learning_service.domain.enrollment.Enrollment;
import org.example.learning_service.domain.enrollment.vo.EnrollmentStatus;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@RequiredArgsConstructor
public class CreateCertificateInteractor {

    private final TransactionManager transactionManager;
    private final EnrollmentRepo enrollmentRepo;
    private final CertificateRepo certificateRepo;
    private final CertificateDomainService certificateDomainService;

    public CertificateView execute(CreateCertificateCommand command) {
        Objects.requireNonNull(command);
        return transactionManager.inTransaction(() -> {
            if (certificateRepo.existsByEnrollmentId(command.enrollmentId())) {
                throw new CertificateAlreadyExistsForEnrollmentException(
                        "Certificate already exists for enrollmentId=" + command.enrollmentId());
            }
            Enrollment enrollment = enrollmentRepo
                    .findSummaryById(command.enrollmentId())
                    .orElseThrow(() -> new EnrollmentNotFoundException(
                            "Enrollment not found: id=" + command.enrollmentId()));
            if (!EnrollmentStatus.COMPLETED.equals(enrollment.getStatus().getValue())) {
                throw new ValidateException(
                        "Certificate can only be issued for completed enrollment; status="
                                + enrollment.getStatus().getValue());
            }

            UUID certificateId = UUID.randomUUID();
            LocalDateTime issuedAt = command.issuedAt() != null ? command.issuedAt() : LocalDateTime.now();
            String serialNo = resolveSerialNo(command.serialNo(), certificateId);

            Certificate certificate = new Certificate(
                    certificateId,
                    enrollment.getId(),
                    enrollment.getUserId(),
                    enrollment.getCourseId(),
                    issuedAt,
                    serialNo,
                    null
            );
            certificateDomainService.attachFileUrl(
                    certificate,
                    CertificateStubS3Url.forCertificate(certificateId, enrollment.getUserId()));
            certificateRepo.save(certificate);

            return toView(certificate);
        });
    }

    private static String resolveSerialNo(String requestedSerial, UUID certificateId) {
        if (requestedSerial != null && !requestedSerial.isBlank()) {
            return requestedSerial.trim();
        }
        return "CERT-" + certificateId;
    }

    private static CertificateView toView(Certificate c) {
        return new CertificateView(
                c.getId(),
                c.getEnrollmentId(),
                c.getUserId(),
                c.getCourseId(),
                c.getIssuedAt(),
                c.getSerialNo(),
                c.getFileUrl()
        );
    }
}
