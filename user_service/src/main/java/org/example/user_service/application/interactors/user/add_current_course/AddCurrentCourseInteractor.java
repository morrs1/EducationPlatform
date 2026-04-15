package org.example.user_service.application.interactors.user.add_current_course;

import lombok.RequiredArgsConstructor;
import org.example.user_service.application.exceptions.UserNotFoundException;
import org.example.user_service.application.ports.TransactionManager;
import org.example.user_service.application.ports.UserRepo;
import org.example.user_service.domain.user.services.UserDomainService;

@RequiredArgsConstructor
public class AddCurrentCourseInteractor {

    private final TransactionManager transactionManager;
    private final UserRepo userRepo;
    private final UserDomainService userDomainService;
    //TODO сделать обратку на случай, если добавляется уже добавленный курс
    public void add(AddCurrentCourseCommand addCurrentCourseCommand) {
        transactionManager.inTransaction(() -> {
                    var user = userRepo.readById(addCurrentCourseCommand.userId())
                            .orElseThrow(() -> new UserNotFoundException("User was not found"));
                    userDomainService.addCurrentCourse(user, addCurrentCourseCommand.currentCourseId());
                    userRepo.update(user);
                }
        );
    }

}
