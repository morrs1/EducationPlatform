package org.example.user_service.application.interactors.user.add_profile_photo;

import lombok.RequiredArgsConstructor;
import org.example.user_service.application.exceptions.UserNotFoundException;
import org.example.user_service.application.ports.PhotoStorage;
import org.example.user_service.application.ports.TransactionManager;
import org.example.user_service.application.ports.UserRepo;
import org.example.user_service.domain.user.services.UserDomainService;

@RequiredArgsConstructor
public class AddProfilePhotoInteractor {
    //TODO переименовать hibernateUserRepo в просто userRepo и S3 в storage
    private final PhotoStorage s3Repo;
    private final TransactionManager transactionManager;
    private final UserRepo hibernateUserRepo;
    private final UserDomainService domainService;

    public AddProfilePhotoView add(AddProfilePhotoCommand command) {

        var user = transactionManager.inTransaction(
                () -> hibernateUserRepo.readUserById(command.userId())
                        .orElseThrow(() -> new UserNotFoundException("User was not found"))
        );
        var addedPhoto = s3Repo.add(command);
        transactionManager.inTransaction(() -> {
            domainService.changeProfilePhotoLink(user, addedPhoto.url());
            hibernateUserRepo.update(user);
        });
        return new AddProfilePhotoView(addedPhoto.bucket(), addedPhoto.key(), addedPhoto.url());
    }


}
