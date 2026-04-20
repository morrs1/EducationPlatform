package com.example.course_service.application.interactors;

import com.example.course_service.application.ports.TransactionManager;
import com.example.course_service.infrasructure.adapters.persistence.HibernateCourseRepo;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@RequiredArgsConstructor
public class ReadCourseByIdInteractor {

    private final HibernateCourseRepo courseRepo;
    private final TransactionManager transactionManager;

    public void readById(UUID id) {
        transactionManager.inTransaction(() -> courseRepo.readById(id));
    }


}
