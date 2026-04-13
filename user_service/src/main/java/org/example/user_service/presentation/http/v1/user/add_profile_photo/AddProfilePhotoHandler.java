package org.example.user_service.presentation.http.v1.user.add_profile_photo;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.user_service.application.interactors.user.add_profile_photo.AddProfilePhotoCommand;
import org.example.user_service.application.interactors.user.add_profile_photo.AddProfilePhotoInteractor;
import org.example.user_service.infrastructure.adapters.s3.SeaweedFSUserProfilePhotoRepo;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
@ConditionalOnBean(SeaweedFSUserProfilePhotoRepo.class)
@Tag(name = "Users", description = "Operations for user management")
public class AddProfilePhotoHandler {

    private final AddProfilePhotoInteractor interactor;

    //TODO попытаться использовать встроенный класс вместо MiltipartFile
    @PostMapping(value = "/add_photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload user profile photo")
    public AddProfilePhotoResponse upload(@RequestParam("user_id") UUID userId, @RequestPart("file") MultipartFile file) throws IOException {
        var addProfilePhotoView = interactor.add(
                new AddProfilePhotoCommand(
                        userId,
                        file.getOriginalFilename(),
                        file.getContentType(),
                        file.getSize(),
                        file.getBytes()
                )
        );
        return new AddProfilePhotoResponse(
                addProfilePhotoView.bucket(),
                addProfilePhotoView.key(),
                addProfilePhotoView.url(),
                file.getOriginalFilename(),
                file.getContentType(),
                file.getSize()
        );
    }


}

