package org.example.user_service.domain.base;

import org.example.user_service.domain.base.exceptions.ValidateException;

public abstract class BaseValueObject {
    public abstract void validate() throws ValidateException;
}
