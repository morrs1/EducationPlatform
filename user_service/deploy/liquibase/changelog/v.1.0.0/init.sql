--liquibase formatted sql

--changeset morrs:1.1

CREATE TABLE users
(
    id                 UUID PRIMARY KEY,
    surname            VARCHAR(255) NOT NULL,
    name               VARCHAR(255) NOT NULL,
    patronymic         VARCHAR(255),
    user_status        VARCHAR(255),
    email              VARCHAR(255),
    password           VARCHAR,
    profile_photo_link VARCHAR,
    current_courses    TEXT[] DEFAULT '{}',
    finished_courses   TEXT[] DEFAULT '{}',
    certificates       TEXT[] DEFAULT '{}'
);