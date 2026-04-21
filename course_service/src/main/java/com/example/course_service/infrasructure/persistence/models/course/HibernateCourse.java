package com.example.course_service.infrasructure.persistence.models.course;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Table(name = "course")
@Entity
@Getter
@Setter
@ToString
public class HibernateCourse {

    @Id
    private UUID id;
    @Column(name = "author_id")
    private UUID authorId;
    private String title;
    @Column(name = "short_description")
    private String shortDescription;
    private String description;
    private String difficulty;
    @Column(name = "language_code")
    private String languageCode;
    @Column(name = "estimated_minutes")
    private Integer estimatedMinutes;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "structure", columnDefinition = "jsonb", nullable = false)
    private CourseStructureJson structure;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "course_tag",
            joinColumns = @JoinColumn(name = "course_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<HibernateTag> tags = new LinkedHashSet<>();

    public record CourseStructureJson(List<ModuleJson> modules) {
    }

    public record ModuleJson(
            UUID id,
            String title,
            String description,
            Integer position,
            Integer estimatedMinutes,
            List<LessonPreviewJson> lessons
    ) {
    }

    public record LessonPreviewJson(
            UUID id,
            String type,
            String title,
            Integer position,
            Integer estimatedMinutes,
            Boolean isPreview
    ) {
    }
}
