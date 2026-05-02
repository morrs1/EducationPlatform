package org.example.learning_service.application.certificate;

import java.util.UUID;

/**
 * Заглушка URL объекта в S3 до реальной загрузки файла сертификата.
 */
public final class CertificateStubS3Url {

    private CertificateStubS3Url() {
    }

    public static String forCertificate(UUID certificateId, UUID userId) {
        return "s3://learning-certificates-stub/" + userId + "/" + certificateId + ".pdf";
    }
}
