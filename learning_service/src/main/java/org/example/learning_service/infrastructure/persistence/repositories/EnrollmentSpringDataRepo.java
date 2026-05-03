package org.example.learning_service.infrastructure.persistence.repositories;

import org.example.learning_service.infrastructure.persistence.models.enrollment.HibernateEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EnrollmentSpringDataRepo extends JpaRepository<HibernateEnrollment, UUID> {

    boolean existsByUserIdAndCourseId(UUID userId, UUID courseId);

    @Query("""
            select distinct e from HibernateEnrollment e
            left join fetch e.lessonCompletions
            where e.userId = :userId and e.courseId = :courseId
            """)
    Optional<HibernateEnrollment> findFetchedByUserIdAndCourseId(
            @Param("userId") UUID userId,
            @Param("courseId") UUID courseId
    );

    @Query("""
            select e from HibernateEnrollment e
            where e.userId = :userId and e.status = :status
            order by e.updatedAt desc
            """)
    List<HibernateEnrollment> findAllByUserIdAndStatusOrdered(
            @Param("userId") UUID userId,
            @Param("status") String status
    );
}
