package com.example.course_service.domain.asset.vo;

import com.example.course_service.domain.base.BaseValueObject;
import com.example.course_service.domain.base.exceptions.ValidateException;
import lombok.Getter;
import lombok.ToString;

import java.util.Objects;

@ToString
@Getter
public class AssetPublicUrl extends BaseValueObject {

    private final String publicUrl;

    public AssetPublicUrl(String publicUrl) {
        this.publicUrl = publicUrl;
        validate();
    }

    @Override
    public void validate() throws ValidateException {
        if (Objects.isNull(publicUrl)) {
            throw new ValidateException("Asset public url must not be null");
        }
        if (publicUrl.isBlank()) {
            throw new ValidateException("Asset public url must not be blank");
        }
        if (publicUrl.length() > 1024) {
            throw new ValidateException("Asset public url length must not exceed 1024 characters");
        }
    }
}
