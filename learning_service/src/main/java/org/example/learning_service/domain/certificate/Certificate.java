package org.example.learning_service.domain.certificate;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.example.learning_service.domain.base.BaseEntity;
import org.example.learning_service.domain.base.exceptions.ValidateException;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Getter
@Setter
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class Certificate extends BaseEntity {

    private UUID enrollmentId;
    private UUID userId;
    private UUID courseId;
    private LocalDateTime issuedAt;
    private String serialNo;
    private String fileUrl;

    public Certificate(
            UUID id,
            UUID enrollmentId,
            UUID userId,
            UUID courseId,
            LocalDateTime issuedAt,
            String serialNo,
            String fileUrl
    ) {
        super(id);
        this.enrollmentId = Objects.requireNonNull(enrollmentId);
        this.userId = Objects.requireNonNull(userId);
        this.courseId = Objects.requireNonNull(courseId);
        this.issuedAt = Objects.requireNonNull(issuedAt);
        this.serialNo = validateSerialNo(serialNo);
        this.fileUrl = fileUrl;
    }

    private static String validateSerialNo(String serialNo) throws ValidateException {
        if (serialNo == null || serialNo.isBlank()) {
            throw new ValidateException("Certificate serial number must not be blank");
        }
        if (serialNo.length() > 128) {
            throw new ValidateException("Certificate serial number must not exceed 128 characters");
        }
        return serialNo.trim();
    }
}
