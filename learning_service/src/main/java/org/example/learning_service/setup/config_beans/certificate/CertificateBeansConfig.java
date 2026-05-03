package org.example.learning_service.setup.config_beans.certificate;

import org.example.learning_service.application.interactors.certificate.create_certificate.CreateCertificateInteractor;
import org.example.learning_service.application.interactors.certificate.get_certificate.GetCertificateInteractor;
import org.example.learning_service.application.ports.CertificateRepo;
import org.example.learning_service.application.ports.EnrollmentRepo;
import org.example.learning_service.application.ports.TransactionManager;
import org.example.learning_service.domain.certificate.services.CertificateDomainService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CertificateBeansConfig {

    @Bean
    public CertificateDomainService certificateDomainService() {
        return new CertificateDomainService();
    }

    @Bean
    public CreateCertificateInteractor createCertificateInteractor(
            TransactionManager transactionManager,
            EnrollmentRepo enrollmentRepo,
            CertificateRepo certificateRepo,
            CertificateDomainService certificateDomainService
    ) {
        return new CreateCertificateInteractor(
                transactionManager,
                enrollmentRepo,
                certificateRepo,
                certificateDomainService
        );
    }

    @Bean
    public GetCertificateInteractor getCertificateInteractor(
            TransactionManager transactionManager,
            CertificateRepo certificateRepo
    ) {
        return new GetCertificateInteractor(transactionManager, certificateRepo);
    }
}
