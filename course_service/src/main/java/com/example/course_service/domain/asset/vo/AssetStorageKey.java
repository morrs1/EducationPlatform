package com.example.course_service.domain.asset.vo;

import com.example.course_service.domain.base.BaseValueObject;
import com.example.course_service.domain.base.exceptions.ValidateException;
import lombok.Getter;
import lombok.ToString;

import java.util.Objects;

@ToString
@Getter
public class AssetStorageKey extends BaseValueObject {

    private final String storageKey;

    public AssetStorageKey(String storageKey) {
        this.storageKey = storageKey;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(storageKey)) {
            throw new ValidateException("Asset storage key must not be null");
        }
        if (storageKey.isBlank()) {
            throw new ValidateException("Asset storage key must not be blank");
        }
        if (storageKey.length() > 1024) {
            throw new ValidateException("Asset storage key length must not exceed 1024 characters");
        }
    }
}
