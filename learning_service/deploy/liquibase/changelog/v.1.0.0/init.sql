--liquibase formatted sql

--changeset morrs:1.1

create table enrollment
(
    id           uuid primary key,
    user_id      uuid        not null,
    course_id    uuid        not null,
    status       varchar(32) not null,
    started_at   timestamptz,
    completed_at timestamptz,
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now(),
    unique (user_id, course_id)
);
create table lesson_completion
(
    id            uuid primary key,
    enrollment_id uuid        not null references enrollment (id) on delete cascade,
    lesson_id     uuid        not null,
    completed_at  timestamptz not null,
    unique (enrollment_id, lesson_id)
);
create table user_activity_day
(
    user_id                 uuid    not null,
    activity_date           date    not null,
    lessons_completed_count integer not null default 0,
    primary key (user_id, activity_date)
);
create table certificate
(
    id            uuid primary key,
    enrollment_id uuid         not null unique references enrollment (id),
    user_id       uuid         not null,
    course_id     uuid         not null,
    issued_at     timestamptz  not null default now(),
    serial_no     varchar(128) not null unique,
    file_url      varchar(1024)
);
