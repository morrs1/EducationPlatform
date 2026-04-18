package com.example.course_service.domain.asset.vo;

import com.example.course_service.domain.base.BaseValueObject;
import com.example.course_service.domain.base.exceptions.ValidateException;
import lombok.Getter;
import lombok.ToString;

import java.util.Objects;
import java.util.Set;

@ToString
@Getter
public class AssetType extends BaseValueObject {

    private static final Set<String> ALLOWED_TYPES =
            Set.of("image", "video", "file", "cover");

    private final String assetType;

    public AssetType(String assetType) {
        this.assetType = assetType;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(assetType)) {
            throw new ValidateException("Asset type must not be null");
        }
        if (assetType.isBlank()) {
            throw new ValidateException("Asset type must not be blank");
        }
        if (!ALLOWED_TYPES.contains(assetType)) {
            throw new ValidateException("Asset type must be one of: image, video, file, cover");
        }
    }
}
