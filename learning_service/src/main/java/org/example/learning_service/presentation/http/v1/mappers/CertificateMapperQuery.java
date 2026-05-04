package org.example.learning_service.presentation.http.v1.mappers;

import org.example.learning_service.application.interactors.certificate.CertificateView;
import org.example.learning_service.presentation.http.v1.certificate.dto.CertificateResponse;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CertificateMapperQuery {

    public CertificateResponse toCertificateResponse(CertificateView view) {
        return new CertificateResponse(
                view.id(),
                view.enrollmentId(),
                view.userId(),
                view.courseId(),
                view.issuedAt(),
                view.serialNo(),
                view.fileUrl()
        );
    }

    public List<CertificateResponse> toCertificateResponses(List<CertificateView> views) {
        return views.stream().map(this::toCertificateResponse).toList();
    }
}
