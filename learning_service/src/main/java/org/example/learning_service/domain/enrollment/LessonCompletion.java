package org.example.learning_service.domain.enrollment;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.example.learning_service.domain.base.BaseEntity;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class LessonCompletion extends BaseEntity {

    private UUID lessonId;
    private LocalDateTime completedAt;

    public LessonCompletion(UUID id, UUID lessonId, LocalDateTime completedAt) {
        super(id);
        this.lessonId = lessonId;
        this.completedAt = completedAt;
    }
}
