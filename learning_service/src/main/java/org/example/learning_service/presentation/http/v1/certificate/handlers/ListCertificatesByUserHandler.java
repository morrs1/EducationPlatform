package org.example.learning_service.presentation.http.v1.certificate.handlers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.learning_service.application.interactors.certificate.list_certificates_by_user.ListCertificatesByUserInteractor;
import org.example.learning_service.presentation.http.v1.certificate.dto.CertificateResponse;
import org.example.learning_service.presentation.http.v1.mappers.CertificateMapperQuery;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/learning/certificate")
@RequiredArgsConstructor
@Tag(name = "Learning certificate", description = "Сертификаты о прохождении курсов")
public class ListCertificatesByUserHandler {

    private final ListCertificatesByUserInteractor listCertificatesByUserInteractor;
    private final CertificateMapperQuery certificateMapperQuery;

    @Operation(
            summary = "Список сертификатов пользователя",
            description = "Возвращает все сертификаты пользователя, от новых к старым по дате выдачи."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Список (может быть пустым)",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = CertificateResponse.class)))
            )
    })
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<List<CertificateResponse>> listByUser(
            @Parameter(description = "Идентификатор пользователя", required = true)
            @PathVariable UUID userId
    ) {
        var views = listCertificatesByUserInteractor.execute(userId);
        return ResponseEntity.ok(certificateMapperQuery.toCertificateResponses(views));
    }
}
