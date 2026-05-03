package org.example.learning_service.presentation.http.v1.certificate.handlers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.learning_service.application.interactors.certificate.get_certificate.GetCertificateInteractor;
import org.example.learning_service.presentation.http.v1.certificate.dto.CertificateResponse;
import org.example.learning_service.presentation.http.v1.mappers.CertificateMapperQuery;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/learning/certificate")
@RequiredArgsConstructor
@Tag(name = "Learning certificate", description = "Сертификаты о прохождении курсов")
public class GetCertificateHandler {

    private final GetCertificateInteractor getCertificateInteractor;
    private final CertificateMapperQuery certificateMapperQuery;

    @Operation(summary = "Получить сертификат по id")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Данные сертификата",
                    content = @Content(schema = @Schema(implementation = CertificateResponse.class))
            ),
            @ApiResponse(responseCode = "404", description = "Сертификат не найден")
    })
    @GetMapping("/{certificateId}")
    public ResponseEntity<CertificateResponse> get(@PathVariable UUID certificateId) {
        var view = getCertificateInteractor.execute(certificateId);
        return ResponseEntity.ok(certificateMapperQuery.toCertificateResponse(view));
    }
}
