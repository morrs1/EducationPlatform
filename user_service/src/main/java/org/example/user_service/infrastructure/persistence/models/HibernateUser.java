package org.example.user_service.infrastructure.persistence.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class HibernateUser {
    @Id
    private UUID id;
    private String surname;
    private String name;
    private String patronymic;
    @Column(name = "user_status")
    private String userStatus;
    private String email;
    private String password;
    @Column(name = "profile_photo_link")
    private String profilePhotoLink;
}
