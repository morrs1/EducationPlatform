package com.example.course_service.domain.course.vo;

import com.example.course_service.domain.base.BaseValueObject;
import com.example.course_service.domain.base.exceptions.ValidateException;
import lombok.Getter;
import lombok.ToString;

import java.util.Objects;
import java.util.UUID;

@ToString
@Getter
public class TagId extends BaseValueObject {

    private final UUID id;

    public TagId(UUID id) {
        this.id = id;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(id)) {
            throw new ValidateException("Tag id must not be null");
        }
        if (id.toString().isBlank()) {
            throw new ValidateException("Tag id must not be blank");
        }
    }
}
