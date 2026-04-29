--liquibase formatted sql

--changeset codex:delete-spring-demo-user

DELETE FROM users
WHERE id = '4ddf2ae0-3da9-46c0-a088-a28726f2aff6';
