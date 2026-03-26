package org.example.user_service.domain.user.vo;

import lombok.Getter;
import lombok.ToString;
import org.example.user_service.domain.base.BaseValueObject;
import org.example.user_service.domain.base.exceptions.ValidateException;

import java.util.Objects;

@ToString
@Getter
public class UserProfilePhotoLink extends BaseValueObject {

    private final String profilePhotoLink;

    public UserProfilePhotoLink(String profilePhotoLink) {
        this.profilePhotoLink = profilePhotoLink;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(profilePhotoLink)) {
            throw new ValidateException("Profile photo link must not be null");
        }
        if (profilePhotoLink.isBlank()) {
            throw new ValidateException("Profile photo link must not be blank");
        }
    }
}
