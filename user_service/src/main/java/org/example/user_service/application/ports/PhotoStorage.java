package org.example.user_service.application.ports;

import org.example.user_service.application.interactors.user.add_profile_photo.AddProfilePhotoCommand;
import org.example.user_service.application.interactors.user.add_profile_photo.AddProfilePhotoView;

public interface PhotoStorage {
    AddProfilePhotoView add(AddProfilePhotoCommand command);
}
