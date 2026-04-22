package com.example.course_service.infrasructure.persistence.models.asset;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "asset")
@Getter
@Setter
public class HibernateAsset {
    @Id
    private UUID id;

    @Column(name = "course_id")
    private UUID courseId;

    @Column(name = "lesson_id")
    private UUID lessonId;

    @Column(name = "asset_type")
    private String assetType;

    @Column(name = "storage_key")
    private String storageKey;

    @Column(name = "public_url")
    private String publicUrl;

    @Column(name = "mime_type")
    private String mimeType;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    @Column(name = "original_filename")
    private String originalFilename;

    private String title;

    @Column(name = "created_at")
    private LocalDateTime created_at;

}
