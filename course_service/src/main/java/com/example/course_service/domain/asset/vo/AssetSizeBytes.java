package com.example.course_service.domain.asset.vo;

import com.example.course_service.domain.base.BaseValueObject;
import com.example.course_service.domain.base.exceptions.ValidateException;
import lombok.Getter;
import lombok.ToString;

import java.util.Objects;

@ToString
@Getter
public class AssetSizeBytes extends BaseValueObject {

    private final Long sizeBytes;

    public AssetSizeBytes(Long sizeBytes) {
        this.sizeBytes = sizeBytes;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(sizeBytes)) {
            throw new ValidateException("Asset size bytes must not be null");
        }
        if (sizeBytes < 0) {
            throw new ValidateException("Asset size bytes must be greater than or equal to 0");
        }
    }
}
