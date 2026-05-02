package org.example.learning_service.domain.base;

import org.example.learning_service.domain.base.exceptions.ValidateException;

public abstract class BaseValueObject {

    public abstract void validate() throws ValidateException;
}
