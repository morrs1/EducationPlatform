package org.example.user_service.application.interactors.user.add_finished_course;

import lombok.RequiredArgsConstructor;
import org.example.user_service.application.exceptions.UserNotFoundException;
import org.example.user_service.application.ports.TransactionManager;
import org.example.user_service.application.ports.UserRepo;
import org.example.user_service.domain.user.services.UserDomainService;

@RequiredArgsConstructor
public class AddFinishedCourseInteractor {

    private final TransactionManager transactionManager;
    private final UserRepo userRepo;
    private final UserDomainService userDomainService;

    public void add(AddFinishedCourseCommand addFinishedCourseCommand) {
        transactionManager.inTransaction(() -> {
                    var user = userRepo.readById(addFinishedCourseCommand.userId())
                            .orElseThrow(() -> new UserNotFoundException("User was not found"));
                    userDomainService.addFinishedCourse(user, addFinishedCourseCommand.finishedCourseId());
                    userRepo.update(user);
                }
        );
    }

}
