package org.example.learning_service.presentation.http.v1.certificate.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(description = "Сертификат о прохождении курса")
public record CertificateResponse(
        @Schema(description = "Идентификатор сертификата")
        UUID id,
        @Schema(description = "Зачисление")
        UUID enrollmentId,
        @Schema(description = "Пользователь")
        UUID userId,
        @Schema(description = "Курс")
        UUID courseId,
        @Schema(description = "Дата выдачи")
        LocalDateTime issuedAt,
        @Schema(description = "Серийный номер")
        String serialNo,
        @Schema(description = "URL файла в S3 (пока заглушка)")
        String fileUrl
) {
}
