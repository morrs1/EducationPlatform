package org.example.user_service.domain.user.vo;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.example.user_service.domain.base.BaseValueObject;
import org.example.user_service.domain.base.exceptions.ValidateException;

import java.util.Objects;
import java.util.UUID;

@ToString
@Getter
public class UserId extends BaseValueObject {

    private final UUID id;

    public UserId(UUID id) {
        this.id = id;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (id == null) throw new ValidateException("ID must be not null");
        if (Objects.equals(id.toString(), "")) throw new ValidateException("ID must be not empty");
    }
}
