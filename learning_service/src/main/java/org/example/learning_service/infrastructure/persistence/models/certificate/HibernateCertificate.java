package org.example.learning_service.infrastructure.persistence.models.certificate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "certificate")
@Getter
@Setter
@NoArgsConstructor
public class HibernateCertificate {

    @Id
    private UUID id;

    @Column(name = "enrollment_id", nullable = false, unique = true)
    private UUID enrollmentId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "course_id", nullable = false)
    private UUID courseId;

    @Column(name = "issued_at", nullable = false)
    private LocalDateTime issuedAt;

    @Column(name = "serial_no", nullable = false, length = 128, unique = true)
    private String serialNo;

    @Column(name = "file_url", length = 1024)
    private String fileUrl;
}
