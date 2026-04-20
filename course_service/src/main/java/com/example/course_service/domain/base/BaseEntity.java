package com.example.course_service.domain.base;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@EqualsAndHashCode(of = "id")
@NoArgsConstructor

public abstract class BaseEntity {

    protected UUID id;

    public BaseEntity(UUID id) {
        this.id = id;
    }
}
