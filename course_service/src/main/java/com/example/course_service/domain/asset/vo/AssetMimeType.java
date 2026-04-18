package com.example.course_service.domain.asset.vo;

import com.example.course_service.domain.base.BaseValueObject;
import com.example.course_service.domain.base.exceptions.ValidateException;
import lombok.Getter;
import lombok.ToString;

import java.util.Objects;

@ToString
@Getter
public class AssetMimeType extends BaseValueObject {

    private final String mimeType;

    public AssetMimeType(String mimeType) {
        this.mimeType = mimeType;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(mimeType)) {
            throw new ValidateException("Asset mime type must not be null");
        }
        if (mimeType.isBlank()) {
            throw new ValidateException("Asset mime type must not be blank");
        }
        if (mimeType.length() > 255) {
            throw new ValidateException("Asset mime type length must not exceed 255 characters");
        }
    }
}
