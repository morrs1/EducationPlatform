package com.example.course_service.infrasructure.persistence.models.lesson;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.example.course_service.infrasructure.persistence.models.course.HibernateCourse;

import java.time.LocalDateTime;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.UUID;

@Entity
@Table(name = "lesson_content")
@Getter
@Setter
@NoArgsConstructor
@ToString
public class HibernateLesson {
    @Id
    @Column(name = "lesson_id")
    private UUID id;

    @Column(name = "course_id", nullable = false)
    private UUID courseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", insertable = false, updatable = false)
    @ToString.Exclude
    private HibernateCourse course;

    @Column(name = "lesson_type", nullable = false)
    private String lessonType;

    @Column(name = "title", nullable = false)
    private String title;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "content", columnDefinition = "jsonb", nullable = false)
    private JsonNode content;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
