--liquibase formatted sql

--changeset codex:user-service-demo-authors

INSERT INTO users (id,
                   surname,
                   name,
                   patronymic,
                   user_status,
                   email)
VALUES ('ed0bda1c-5f0b-4677-9698-b522b3efacc4',
        'Иванов',
        'Илья',
        'Андреевич',
        'JAVA_MENTOR',
        'ilya.ivanov@example.com'),
       ('4ddf2ae0-3da9-46c0-a088-a28726f2aff6',
        'Петров',
        'Максим',
        'Олегович',
        'SPRING_MENTOR',
        'maksim.petrov@example.com'),
       ('909262ef-d229-47aa-8fdd-8c3f93adfd5d',
        'Смирнова',
        'Анна',
        'Сергеевна',
        'PYTHON_MENTOR',
        'anna.smirnova@example.com')
ON CONFLICT (id) DO UPDATE
SET surname = EXCLUDED.surname,
    name = EXCLUDED.name,
    patronymic = EXCLUDED.patronymic,
    user_status = EXCLUDED.user_status,
    email = EXCLUDED.email;
