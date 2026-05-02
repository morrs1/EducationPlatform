package org.example.learning_service.domain.base;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public abstract class BaseEntity {

    protected UUID id;

    protected BaseEntity(UUID id) {
        this.id = id;
    }
}
