package org.example.user_service.domain.user.vo;

import lombok.Getter;
import lombok.ToString;
import org.example.user_service.domain.base.BaseValueObject;
import org.example.user_service.domain.base.exceptions.ValidateException;

import java.util.Objects;
import java.util.UUID;

@ToString
@Getter
public class UserCertificate extends BaseValueObject {

    private final UUID certificate;

    public UserCertificate(UUID certificate) {
        this.certificate = certificate;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(certificate)) {
            throw new ValidateException("Certificate must not be null");
        }
    }
}
