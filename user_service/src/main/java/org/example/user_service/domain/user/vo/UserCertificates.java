package org.example.user_service.domain.user.vo;

import lombok.Getter;
import lombok.ToString;
import org.example.user_service.domain.base.BaseValueObject;
import org.example.user_service.domain.base.exceptions.ValidateException;

import java.util.List;
import java.util.Objects;

@ToString
@Getter
public class UserCertificates extends BaseValueObject {

    private final List<String> certificates;

    public UserCertificates(List<String> certificates) {
        this.certificates = Objects.isNull(certificates) ? null : List.copyOf(certificates);
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(certificates)) {
            throw new ValidateException("Certificates must not be null");
        }
        for (String certificate : certificates) {
            if (Objects.isNull(certificate) || certificate.isBlank()) {
                throw new ValidateException("Certificates must not contain null or blank values");
            }
        }
    }
}
