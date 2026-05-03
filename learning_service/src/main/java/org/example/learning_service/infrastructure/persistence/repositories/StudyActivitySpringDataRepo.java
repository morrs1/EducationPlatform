package org.example.learning_service.infrastructure.persistence.repositories;

import org.example.learning_service.infrastructure.persistence.models.activity.HibernateUserStudyDay;
import org.example.learning_service.infrastructure.persistence.models.activity.HibernateUserStudyDayId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudyActivitySpringDataRepo extends JpaRepository<HibernateUserStudyDay, HibernateUserStudyDayId> {

    @Query("""
            select u from HibernateUserStudyDay u
            where u.id.userId = :userId and u.id.activityDate = :date
            """)
    Optional<HibernateUserStudyDay> findOneByUserAndDate(@Param("userId") UUID userId, @Param("date") LocalDate date);

    @Query("""
            select u from HibernateUserStudyDay u
            where u.id.userId = :userId
              and u.id.activityDate between :from and :to
            order by u.id.activityDate asc
            """)
    List<HibernateUserStudyDay> findAllByUserAndDateRange(
            @Param("userId") UUID userId,
            @Param("from") LocalDate fromInclusive,
            @Param("to") LocalDate toInclusive
    );
}
