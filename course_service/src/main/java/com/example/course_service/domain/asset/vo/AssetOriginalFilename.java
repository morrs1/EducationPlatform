package com.example.course_service.domain.asset.vo;

import com.example.course_service.domain.base.BaseValueObject;
import com.example.course_service.domain.base.exceptions.ValidateException;
import lombok.Getter;
import lombok.ToString;

import java.util.Objects;

@ToString
@Getter
public class AssetOriginalFilename extends BaseValueObject {

    private final String originalFilename;

    public AssetOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(originalFilename)) {
            throw new ValidateException("Asset original filename must not be null");
        }
        if (originalFilename.isBlank()) {
            throw new ValidateException("Asset original filename must not be blank");
        }
        if (originalFilename.length() > 255) {
            throw new ValidateException("Asset original filename length must not exceed 255 characters");
        }
    }
}
