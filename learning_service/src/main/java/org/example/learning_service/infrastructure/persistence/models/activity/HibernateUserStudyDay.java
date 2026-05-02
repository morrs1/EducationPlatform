package org.example.learning_service.infrastructure.persistence.models.activity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_activity_day")
@Getter
@Setter
@NoArgsConstructor
public class HibernateUserStudyDay {

    @EmbeddedId
    private HibernateUserStudyDayId id;

    @Column(name = "lessons_completed_count", nullable = false)
    private int lessonsCompletedCount;
}
