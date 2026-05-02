package org.example.learning_service.presentation.http.v1.certificate.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(description = "Выдать сертификат по завершённому зачислению")
public record CreateCertificateRequest(
        @Schema(description = "Зачисление с статусом completed", requiredMode = Schema.RequiredMode.REQUIRED)
        UUID enrollmentId,

        @Schema(description = "Дата выдачи (если не указана — текущее время сервера)")
        LocalDateTime issuedAt,

        @Schema(description = "Серийный номер (если не указан — генерируется)")
        String serialNo
) {
}
