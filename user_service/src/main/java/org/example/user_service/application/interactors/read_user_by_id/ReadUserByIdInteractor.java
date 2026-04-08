package org.example.user_service.application.interactors.read_user_by_id;

import lombok.RequiredArgsConstructor;
import org.example.user_service.application.ports.TransactionManager;
import org.example.user_service.application.ports.UserRepo;
import org.example.user_service.domain.base.exceptions.BaseException;
import org.example.user_service.domain.user.vo.UserCertificate;
import org.example.user_service.domain.user.vo.UserCurrentCourse;
import org.example.user_service.domain.user.vo.UserFinishedCourse;

@RequiredArgsConstructor
public class ReadUserByIdInteractor {

    private final TransactionManager transactionManager;
    private final UserRepo userRepo;
//TODO подумать как сделать маппер или спрятать логику маппинга
    public ReadUserByIdView readUserById(ReadUserByIdQuery userQuery) {
        var user = transactionManager.inTransaction(() -> userRepo.readUserById(userQuery.id()));
        if (user.isEmpty()) throw new BaseException("ff", 409);
        return new ReadUserByIdView(user.get().getSurname().getSurname(),
                user.get().getName().getName(),
                user.get().getPatronymic().getPatronymic(),
                user.get().getUserStatus().getStatus(),
                user.get().getEmail().getEmail(),
                user.get().getProfilePhotoLink().getProfilePhotoLink(),
                user.get().getCurrentCourses().stream().map(UserCurrentCourse::getCurrentCourse).toList(),
                user.get().getFinishedCourses().stream().map(UserFinishedCourse::getFinishedCourse).toList(),
                user.get().getCertificates().stream().map(UserCertificate::getCertificate).toList()
        );
    }

}
