package org.example.user_service.domain.base;

import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.util.UUID;

@EqualsAndHashCode(of = "id")
@Getter
public abstract class BaseEntity {
    protected UUID id;

    public BaseEntity(UUID id) {
        this.id = id;
    }
}