--liquibase formatted sql

--changeset codex:restore-spring-demo-user

INSERT INTO users (id,
                   surname,
                   name,
                   patronymic,
                   user_status,
                   email,
                   password,
                   profile_photo_link,
                   role)
VALUES ('4ddf2ae0-3da9-46c0-a088-a28726f2aff6',
        'Петров',
        'Максим',
        'Олегович',
        'SPRING_MENTOR',
        'maksim.petrov@example.com',
        'DemoPass123',
        '',
        'AUTHOR')
ON CONFLICT (id) DO UPDATE
SET surname = EXCLUDED.surname,
    name = EXCLUDED.name,
    patronymic = EXCLUDED.patronymic,
    user_status = EXCLUDED.user_status,
    email = EXCLUDED.email,
    password = EXCLUDED.password,
    profile_photo_link = EXCLUDED.profile_photo_link,
    role = EXCLUDED.role;
