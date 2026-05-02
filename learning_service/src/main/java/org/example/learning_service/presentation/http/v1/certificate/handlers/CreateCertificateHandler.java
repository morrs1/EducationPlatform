package org.example.learning_service.presentation.http.v1.certificate.handlers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.learning_service.application.interactors.certificate.create_certificate.CreateCertificateCommand;
import org.example.learning_service.application.interactors.certificate.create_certificate.CreateCertificateInteractor;
import org.example.learning_service.presentation.http.v1.certificate.dto.CertificateResponse;
import org.example.learning_service.presentation.http.v1.certificate.dto.CreateCertificateRequest;
import org.example.learning_service.presentation.http.v1.mappers.CertificateMapperQuery;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/learning/certificate")
@RequiredArgsConstructor
@Tag(name = "Learning certificate", description = "Сертификаты о прохождении курсов")
public class CreateCertificateHandler {

    private final CreateCertificateInteractor createCertificateInteractor;
    private final CertificateMapperQuery certificateMapperQuery;

    @Operation(
            summary = "Создать сертификат",
            description = """
                    Создаёт запись сертификата для завершённого зачисления.
                    URL файла в S3 задаётся формальной заглушкой до реальной интеграции с хранилищем.
                    """
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Сертификат создан",
                    content = @Content(schema = @Schema(implementation = CertificateResponse.class))
            ),
            @ApiResponse(responseCode = "404", description = "Зачисление не найдено"),
            @ApiResponse(responseCode = "409", description = "Сертификат для этого зачисления уже существует"),
            @ApiResponse(responseCode = "400", description = "Зачисление не completed или нарушены правила домена")
    })
    @PostMapping
    public ResponseEntity<CertificateResponse> create(@RequestBody CreateCertificateRequest request) {
        var view = createCertificateInteractor.execute(
                new CreateCertificateCommand(request.enrollmentId(), request.issuedAt(), request.serialNo())
        );
        return ResponseEntity.ok(certificateMapperQuery.toCertificateResponse(view));
    }
}
