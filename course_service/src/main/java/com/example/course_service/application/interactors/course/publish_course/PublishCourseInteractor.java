package com.example.course_service.application.interactors.course.publish_course;

import com.example.course_service.application.ports.CourseRepo;
import com.example.course_service.application.ports.TransactionManager;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@RequiredArgsConstructor
public class PublishCourseInteractor {

    private final TransactionManager transactionManager;
    private final CourseRepo courseRepo;

    public void publish(UUID courseId) {
        transactionManager.inTransaction(() -> courseRepo.publishCourse(courseId));
    }
}
