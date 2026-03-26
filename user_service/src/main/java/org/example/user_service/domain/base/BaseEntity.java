package org.example.user_service.domain.base;

import lombok.EqualsAndHashCode;

import java.util.UUID;

@EqualsAndHashCode(of = "id")
public abstract class BaseEntity {
    private UUID id;
}