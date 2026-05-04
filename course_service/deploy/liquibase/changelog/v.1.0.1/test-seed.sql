--liquibase formatted sql

--changeset morrs:course-service-test-seed

INSERT INTO tag (id, name)
VALUES ('f3b7f1cf-97f7-4460-8d92-bbc9acd7348b', 'java'),
       ('0e71f8b8-7b0d-48bf-9cef-7a8dd6ae9c39', 'backend'),
       ('3d92fdb9-0db1-43ca-8b8f-f805d5fb4bd9', 'algorithms'),
       ('53a70a48-4985-4298-b9d0-45e7752d25d4', 'spring');

INSERT INTO course (id,
                    author_id,
                    title,
                    short_description,
                    description,
                    difficulty,
                    language_code,
                    estimated_minutes,
                    structure,
                    created_at,
                    updated_at)
VALUES (
           '4ec4e0ea-2d8f-4a55-b7d2-7be0b85d75d8',
           'ed0bda1c-5f0b-4677-9698-b522b3efacc4',
           'Java Core Start',
           'Базовый курс по синтаксису Java, типам данных и первым задачам.',
           'Пошаговый курс по основам Java: переменные, условия, циклы и практика на небольших заданиях.',
           'beginner',
           'ru',
           95,
           '{
             "modules": [
               {
                 "id": "6d0fdbbf-e4ba-433e-87e5-fbaef5feb8ea",
                 "courseId": "4ec4e0ea-2d8f-4a55-b7d2-7be0b85d75d8",
                 "title": "Основы языка",
                 "description": "Синтаксис, типы данных и первая практика.",
                 "position": 1,
                 "estimatedMinutes": 95,
                 "lessons": [
                   {
                     "id": "4fe8d1b8-3fd7-4107-8c18-0df73f5162d9",
                     "type": "theory",
                     "title": "Переменные и типы данных",
                     "position": 1,
                     "estimatedMinutes": 20,
                     "isPreview": true
                   },
                   {
                     "id": "f8fa58f0-b8ba-4b42-9302-14f58af74373",
                     "type": "quiz",
                     "title": "Мини-квиз по синтаксису",
                     "position": 2,
                     "estimatedMinutes": 15,
                     "isPreview": false
                   },
                   {
                     "id": "5555181a-bd6d-4041-b5d4-c6cca3f9f7a7",
                     "type": "coding",
                     "title": "Практика: квадрат числа",
                     "position": 3,
                     "estimatedMinutes": 60,
                     "isPreview": false
                   }
                 ]
               }
             ]
           }'::jsonb,
           TIMESTAMPTZ '2026-04-22 09:00:00+03',
           TIMESTAMPTZ '2026-04-22 09:00:00+03'
       ),
       (
           '51652887-b537-468f-91e0-bc4ee1ddb4fd',
           '4ddf2ae0-3da9-46c0-a088-a28726f2aff6',
           'Spring Boot REST Basics',
           'Курс по созданию простого REST API на Spring Boot.',
           'Курс знакомит с контроллерами, сервисами, DTO и обработкой HTTP-запросов в Spring Boot.',
           'intermediate',
           'ru',
           80,
           '{
             "modules": [
               {
                 "id": "ab8d5ae2-c866-4946-ae20-23ec2e2b1645",
                 "courseId": "51652887-b537-468f-91e0-bc4ee1ddb4fd",
                 "title": "REST API на Spring Boot",
                 "description": "Контроллеры, маршруты и структура простого сервиса.",
                 "position": 1,
                 "estimatedMinutes": 80,
                 "lessons": [
                   {
                     "id": "cb7fec8e-c93d-455f-bfe8-535ce2fe11d9",
                     "type": "theory",
                     "title": "Что такое REST контроллер",
                     "position": 1,
                     "estimatedMinutes": 25,
                     "isPreview": true
                   },
                   {
                     "id": "fa2416f1-4c87-4d0f-bf46-b72d38fe4f03",
                     "type": "coding",
                     "title": "Практика: endpoint hello",
                     "position": 2,
                     "estimatedMinutes": 55,
                     "isPreview": false
                   }
                 ]
               }
             ]
           }'::jsonb,
           TIMESTAMPTZ '2026-04-22 09:30:00+03',
           TIMESTAMPTZ '2026-04-22 09:30:00+03'
       );

INSERT INTO course_tag (course_id, tag_id)
VALUES ('4ec4e0ea-2d8f-4a55-b7d2-7be0b85d75d8', 'f3b7f1cf-97f7-4460-8d92-bbc9acd7348b'),
       ('4ec4e0ea-2d8f-4a55-b7d2-7be0b85d75d8', '0e71f8b8-7b0d-48bf-9cef-7a8dd6ae9c39'),
       ('4ec4e0ea-2d8f-4a55-b7d2-7be0b85d75d8', '3d92fdb9-0db1-43ca-8b8f-f805d5fb4bd9'),
       ('51652887-b537-468f-91e0-bc4ee1ddb4fd', '0e71f8b8-7b0d-48bf-9cef-7a8dd6ae9c39'),
       ('51652887-b537-468f-91e0-bc4ee1ddb4fd', '53a70a48-4985-4298-b9d0-45e7752d25d4'),
       ('51652887-b537-468f-91e0-bc4ee1ddb4fd', 'f3b7f1cf-97f7-4460-8d92-bbc9acd7348b');

INSERT INTO lesson_content (lesson_id,
                            course_id,
                            lesson_type,
                            title,
                            content,
                            created_at,
                            updated_at)
VALUES (
           '4fe8d1b8-3fd7-4107-8c18-0df73f5162d9',
           '4ec4e0ea-2d8f-4a55-b7d2-7be0b85d75d8',
           'theory',
           'Переменные и типы данных',
           '{
             "markdown": "# Переменные и типы данных\nJava хранит значения в переменных. У каждой переменной есть тип, который определяет допустимые операции и объём памяти."
           }'::jsonb,
           TIMESTAMPTZ '2026-04-22 09:00:00+03',
           TIMESTAMPTZ '2026-04-22 09:00:00+03'
       ),
       (
           'f8fa58f0-b8ba-4b42-9302-14f58af74373',
           '4ec4e0ea-2d8f-4a55-b7d2-7be0b85d75d8',
           'quiz',
           'Мини-квиз по синтаксису',
           '{
             "introMarkdown": "## Проверим базовые знания по Java",
             "questions": [
               {
                 "id": "2bf04ab0-7b40-4c72-bdc9-0cd9966cd9e9",
                 "type": "single_choice",
                 "text": "Какой тип обычно используют для целых чисел?",
                 "options": [
                   {
                     "id": "3454f55c-9c44-41f3-bd97-869f3292461f",
                     "text": "int",
                     "isCorrect": true
                   },
                   {
                     "id": "8d628d31-6a15-4544-b708-c3f1f93920cc",
                     "text": "String",
                     "isCorrect": false
                   }
                 ]
               },
               {
                 "id": "7f8fd157-d5d0-4da1-8af8-eb91d5034745",
                 "type": "single_choice",
                 "text": "Как записывается логическое значение истины в Java?",
                 "options": [
                   {
                     "id": "c2f7f610-7838-434c-9f33-c3d1127b31b7",
                     "text": "true",
                     "isCorrect": true
                   },
                   {
                     "id": "f0ee0abd-8df1-4cde-8089-50f2de11e4d8",
                     "text": "yes",
                     "isCorrect": false
                   }
                 ]
               }
             ]
           }'::jsonb,
           TIMESTAMPTZ '2026-04-22 09:10:00+03',
           TIMESTAMPTZ '2026-04-22 09:10:00+03'
       ),
       (
           '5555181a-bd6d-4041-b5d4-c6cca3f9f7a7',
           '4ec4e0ea-2d8f-4a55-b7d2-7be0b85d75d8',
           'coding',
           'Практика: квадрат числа',
           '{
             "taskMarkdown": "## Задача\nПрочитайте одно целое число и выведите его квадрат.",
             "checkerType": "stdin_stdout",
             "languages": [
               {
                 "language": "java",
                 "starterCode": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n    }\n}"
               }
             ],
             "testCases": [
               {
                 "id": "a30214d9-7143-4f9d-b5db-b0fcbf578afd",
                 "isPublic": true,
                 "input": "5\n",
                 "expectedOutput": "25\n"
               },
               {
                 "id": "53cca73f-b8b5-4552-ba10-caa942745d25",
                 "isPublic": false,
                 "input": "12\n",
                 "expectedOutput": "144\n"
               }
             ]
           }'::jsonb,
           TIMESTAMPTZ '2026-04-22 09:20:00+03',
           TIMESTAMPTZ '2026-04-22 09:20:00+03'
       ),
       (
           'cb7fec8e-c93d-455f-bfe8-535ce2fe11d9',
           '51652887-b537-468f-91e0-bc4ee1ddb4fd',
           'theory',
           'Что такое REST контроллер',
           '{
             "markdown": "# REST контроллер\nКонтроллер принимает HTTP-запрос, извлекает входные данные и передаёт управление в application или service слой."
           }'::jsonb,
           TIMESTAMPTZ '2026-04-22 09:30:00+03',
           TIMESTAMPTZ '2026-04-22 09:30:00+03'
       ),
       (
           'fa2416f1-4c87-4d0f-bf46-b72d38fe4f03',
           '51652887-b537-468f-91e0-bc4ee1ddb4fd',
           'coding',
           'Практика: endpoint hello',
           '{
             "taskMarkdown": "## Задача\nСоздайте GET endpoint `/hello`, который возвращает строку `Hello, student!`.",
             "checkerType": "manual_review",
             "languages": [
               {
                 "language": "java",
                 "starterCode": "@RestController\npublic class HelloController {\n\n}"
               }
             ],
             "testCases": [
               {
                 "id": "d89d2da1-2fca-4f24-b056-35916cca8e75",
                 "isPublic": true,
                 "input": "GET /hello",
                 "expectedOutput": "Hello, student!"
               }
             ]
           }'::jsonb,
           TIMESTAMPTZ '2026-04-22 09:40:00+03',
           TIMESTAMPTZ '2026-04-22 09:40:00+03'
       );

INSERT INTO asset (id,
                   course_id,
                   lesson_id,
                   asset_type,
                   storage_key,
                   public_url,
                   mime_type,
                   size_bytes,
                   original_filename,
                   title,
                   created_at)
VALUES (
           'ee6af12a-f482-4ec3-bf65-50b4b4f7d939',
           '4ec4e0ea-2d8f-4a55-b7d2-7be0b85d75d8',
           NULL,
           'cover',
           'courses/4ec4e0ea-2d8f-4a55-b7d2-7be0b85d75d8/cover/java-core-start.png',
           'https://cdn.example.local/course-service/courses/4ec4e0ea-2d8f-4a55-b7d2-7be0b85d75d8/cover/java-core-start.png',
           'image/png',
           245760,
           'java-core-start-cover.png',
           'Обложка курса Java Core Start',
           TIMESTAMPTZ '2026-04-22 08:55:00+03'
       ),
       (
           '8e3d68dd-4b89-474f-b2c0-9ceb9e85b8c0',
           '4ec4e0ea-2d8f-4a55-b7d2-7be0b85d75d8',
           '4fe8d1b8-3fd7-4107-8c18-0df73f5162d9',
           'image',
           'courses/4ec4e0ea-2d8f-4a55-b7d2-7be0b85d75d8/lessons/4fe8d1b8-3fd7-4107-8c18-0df73f5162d9/variables-diagram.png',
           'https://cdn.example.local/course-service/courses/4ec4e0ea-2d8f-4a55-b7d2-7be0b85d75d8/lessons/4fe8d1b8-3fd7-4107-8c18-0df73f5162d9/variables-diagram.png',
           'image/png',
           98304,
           'variables-diagram.png',
           'Схема переменных и типов данных',
           TIMESTAMPTZ '2026-04-22 09:01:00+03'
       ),
       (
           '8df6d696-ad8b-4725-a883-0d4ac98ceff7',
           '4ec4e0ea-2d8f-4a55-b7d2-7be0b85d75d8',
           '5555181a-bd6d-4041-b5d4-c6cca3f9f7a7',
           'file',
           'courses/4ec4e0ea-2d8f-4a55-b7d2-7be0b85d75d8/lessons/5555181a-bd6d-4041-b5d4-c6cca3f9f7a7/square-task.pdf',
           'https://cdn.example.local/course-service/courses/4ec4e0ea-2d8f-4a55-b7d2-7be0b85d75d8/lessons/5555181a-bd6d-4041-b5d4-c6cca3f9f7a7/square-task.pdf',
           'application/pdf',
           184320,
           'square-task.pdf',
           'Условие задачи в PDF',
           TIMESTAMPTZ '2026-04-22 09:21:00+03'
       ),
       (
           '26a0356f-cd33-4597-aa83-92a67d1b3d83',
           '51652887-b537-468f-91e0-bc4ee1ddb4fd',
           NULL,
           'cover',
           'courses/51652887-b537-468f-91e0-bc4ee1ddb4fd/cover/spring-boot-rest-basics.png',
           'https://cdn.example.local/course-service/courses/51652887-b537-468f-91e0-bc4ee1ddb4fd/cover/spring-boot-rest-basics.png',
           'image/png',
           262144,
           'spring-boot-rest-basics-cover.png',
           'Обложка курса Spring Boot REST Basics',
           TIMESTAMPTZ '2026-04-22 09:25:00+03'
       ),
       (
           'c56f1d30-1dcc-4fdc-a743-833a95f34515',
           '51652887-b537-468f-91e0-bc4ee1ddb4fd',
           'cb7fec8e-c93d-455f-bfe8-535ce2fe11d9',
           'video',
           'courses/51652887-b537-468f-91e0-bc4ee1ddb4fd/lessons/cb7fec8e-c93d-455f-bfe8-535ce2fe11d9/rest-controller-intro.mp4',
           'https://cdn.example.local/course-service/courses/51652887-b537-468f-91e0-bc4ee1ddb4fd/lessons/cb7fec8e-c93d-455f-bfe8-535ce2fe11d9/rest-controller-intro.mp4',
           'video/mp4',
           15728640,
           'rest-controller-intro.mp4',
           'Видео: введение в REST контроллеры',
           TIMESTAMPTZ '2026-04-22 09:31:00+03'
       ),
       (
           '5323daf6-c75c-4675-810d-56a938c0a853',
           '51652887-b537-468f-91e0-bc4ee1ddb4fd',
           'fa2416f1-4c87-4d0f-bf46-b72d38fe4f03',
           'file',
           'courses/51652887-b537-468f-91e0-bc4ee1ddb4fd/lessons/fa2416f1-4c87-4d0f-bf46-b72d38fe4f03/hello-endpoint-checklist.txt',
           'https://cdn.example.local/course-service/courses/51652887-b537-468f-91e0-bc4ee1ddb4fd/lessons/fa2416f1-4c87-4d0f-bf46-b72d38fe4f03/hello-endpoint-checklist.txt',
           'text/plain',
           2048,
           'hello-endpoint-checklist.txt',
           'Чеклист для задания hello endpoint',
           TIMESTAMPTZ '2026-04-22 09:41:00+03'
       );

--changeset morrs:course-service-module-course-id

UPDATE course
SET structure = jsonb_set(
        structure,
        '{modules}',
        (
            SELECT jsonb_agg(
                           CASE
                               WHEN jsonb_path_exists(module, '$.courseId') THEN module
                               ELSE jsonb_set(module, '{courseId}', to_jsonb(course.id::text), true)
                               END
                   )
            FROM jsonb_array_elements(structure -> 'modules') AS module
        ),
        true
                )
WHERE jsonb_typeof(structure -> 'modules') = 'array';

--changeset morrs:course-service-fts-demo-courses

INSERT INTO course (id,
                    author_id,
                    title,
                    short_description,
                    description,
                    difficulty,
                    language_code,
                    estimated_minutes,
                    structure,
                    is_preview,
                    created_at,
                    updated_at)
VALUES (
           'b1010101-a010-4010-8010-010101010101',
           'ed0bda1c-5f0b-4677-9698-b522b3efacc4',
           'Java для начинающих: первые шаги',
           'Старт по Java для тех, кто только входит в язык.',
           'После этого курса вы разберётесь с базовым синтаксисом и простыми программами.',
           'beginner',
           'ru',
           45,
           '{
             "modules": [
               {
                 "id": "c010101a-a010-4010-8010-a0101010101a",
                 "courseId": "b1010101-a010-4010-8010-010101010101",
                 "title": "Модуль 1",
                 "description": "Введение.",
                 "position": 1,
                 "estimatedMinutes": 45,
                 "lessons": [
                   {
                     "id": "e010101a-a010-4010-8010-e0101010101a",
                     "type": "theory",
                     "title": "Вводная лекция",
                     "position": 1,
                     "estimatedMinutes": 45,
                     "isPreview": true
                   }
                 ]
               }
             ]
           }'::jsonb,
           TRUE,
           TIMESTAMPTZ '2026-04-23 10:00:00+03',
           TIMESTAMPTZ '2026-04-23 10:00:00+03'
       ),
       (
           'b2020202-a020-4020-8020-020202020202',
           'ed0bda1c-5f0b-4677-9698-b522b3efacc4',
           'Java для начинающих: практика коллекций',
           'Продолжение базового трека — списки, множества и карты.',
           'Много коротких задач на ArrayList, HashSet и HashMap.',
           'beginner',
           'ru',
           60,
           '{
             "modules": [
               {
                 "id": "c020202a-a020-4020-8020-a0202020202a",
                 "courseId": "b2020202-a020-4020-8020-020202020202",
                 "title": "Модуль 1",
                 "description": "Коллекции.",
                 "position": 1,
                 "estimatedMinutes": 60,
                 "lessons": [
                   {
                     "id": "e020202a-a020-4020-8020-e0202020202a",
                     "type": "theory",
                     "title": "Коллекции в Java",
                     "position": 1,
                     "estimatedMinutes": 60,
                     "isPreview": true
                   }
                 ]
               }
             ]
           }'::jsonb,
           TRUE,
           TIMESTAMPTZ '2026-04-23 10:15:00+03',
           TIMESTAMPTZ '2026-04-23 10:15:00+03'
       ),
       (
           'b3030303-a030-4030-8030-030303030303',
           '4ddf2ae0-3da9-46c0-a088-a28726f2aff6',
           'Spring Security с нуля',
           'Защита REST-приложений на Spring.',
           'Аутентификация, авторизация, базовая конфигурация security chain.',
           'intermediate',
           'ru',
           90,
           '{
             "modules": [
               {
                 "id": "c030303a-a030-4030-8030-a0303030303a",
                 "courseId": "b3030303-a030-4030-8030-030303030303",
                 "title": "Модуль 1",
                 "description": "Security.",
                 "position": 1,
                 "estimatedMinutes": 90,
                 "lessons": [
                   {
                     "id": "e030303a-a030-4030-8030-e0303030303a",
                     "type": "theory",
                     "title": "Введение в Spring Security",
                     "position": 1,
                     "estimatedMinutes": 90,
                     "isPreview": true
                   }
                 ]
               }
             ]
           }'::jsonb,
           TRUE,
           TIMESTAMPTZ '2026-04-23 10:30:00+03',
           TIMESTAMPTZ '2026-04-23 10:30:00+03'
       ),
       (
           'b4040404-a040-4040-8040-040404040404',
           '4ddf2ae0-3da9-46c0-a088-a28726f2aff6',
           'Spring Boot и микросервисы',
           'Как собрать несколько сервисов на Spring Boot.',
           'Конфигурация, профили, межсервисное взаимодействие на introductory уровне.',
           'intermediate',
           'ru',
           100,
           '{
             "modules": [
               {
                 "id": "c040404a-a040-4040-8040-a0404040404a",
                 "courseId": "b4040404-a040-4040-8040-040404040404",
                 "title": "Модуль 1",
                 "description": "Микросервисы.",
                 "position": 1,
                 "estimatedMinutes": 100,
                 "lessons": [
                   {
                     "id": "e040404a-a040-4040-8040-e0404040404a",
                     "type": "theory",
                     "title": "Обзор паттернов",
                     "position": 1,
                     "estimatedMinutes": 100,
                     "isPreview": true
                   }
                 ]
               }
             ]
           }'::jsonb,
           TRUE,
           TIMESTAMPTZ '2026-04-23 10:45:00+03',
           TIMESTAMPTZ '2026-04-23 10:45:00+03'
       ),
       (
           'b5050505-a050-4050-8050-050505050505',
           '4ddf2ae0-3da9-46c0-a088-a28726f2aff6',
           'Spring Data JPA в Spring Boot',
           'Репозитории и сущности в типичном Spring Boot проекте.',
           'От Entity до CrudRepository и простых запросов.',
           'intermediate',
           'ru',
           85,
           '{
             "modules": [
               {
                 "id": "c050505a-a050-4050-8050-a0505050505a",
                 "courseId": "b5050505-a050-4050-8050-050505050505",
                 "title": "Модуль 1",
                 "description": "JPA.",
                 "position": 1,
                 "estimatedMinutes": 85,
                 "lessons": [
                   {
                     "id": "e050505a-a050-4050-8050-e0505050505a",
                     "type": "theory",
                     "title": "Первая сущность",
                     "position": 1,
                     "estimatedMinutes": 85,
                     "isPreview": true
                   }
                 ]
               }
             ]
           }'::jsonb,
           TRUE,
           TIMESTAMPTZ '2026-04-23 11:00:00+03',
           TIMESTAMPTZ '2026-04-23 11:00:00+03'
       ),
       (
           'b6060606-a060-4060-8060-060606060606',
           'ed0bda1c-5f0b-4677-9698-b522b3efacc4',
           'Python основы: синтаксис',
           'Первый модуль по Python.',
           'Переменные, типы, ветвления и циклы.',
           'beginner',
           'ru',
           55,
           '{
             "modules": [
               {
                 "id": "c060606a-a060-4060-8060-a0606060606a",
                 "courseId": "b6060606-a060-4060-8060-060606060606",
                 "title": "Модуль 1",
                 "description": "Синтаксис.",
                 "position": 1,
                 "estimatedMinutes": 55,
                 "lessons": [
                   {
                     "id": "e060606a-a060-4060-8060-e0606060606a",
                     "type": "theory",
                     "title": "Что такое Python",
                     "position": 1,
                     "estimatedMinutes": 55,
                     "isPreview": true
                   }
                 ]
               }
             ]
           }'::jsonb,
           TRUE,
           TIMESTAMPTZ '2026-04-23 11:15:00+03',
           TIMESTAMPTZ '2026-04-23 11:15:00+03'
       ),
       (
           'b7070707-a070-4070-8070-070707070707',
           'ed0bda1c-5f0b-4677-9698-b522b3efacc4',
           'Python основы: структуры данных',
           'Списки, словари, множества в Python.',
           'Продолжаем тему базового Python на практике.',
           'beginner',
           'ru',
           65,
           '{
             "modules": [
               {
                 "id": "c070707a-a070-4070-8070-a0707070707a",
                 "courseId": "b7070707-a070-4070-8070-070707070707",
                 "title": "Модуль 1",
                 "description": "Структуры.",
                 "position": 1,
                 "estimatedMinutes": 65,
                 "lessons": [
                   {
                     "id": "e070707a-a070-4070-8070-e0707070707a",
                     "type": "theory",
                     "title": "Структуры данных",
                     "position": 1,
                     "estimatedMinutes": 65,
                     "isPreview": true
                   }
                 ]
               }
             ]
           }'::jsonb,
           TRUE,
           TIMESTAMPTZ '2026-04-23 11:30:00+03',
           TIMESTAMPTZ '2026-04-23 11:30:00+03'
       ),
       (
           'b8080808-a080-4080-8080-080808080808',
           '4ddf2ae0-3da9-46c0-a088-a28726f2aff6',
           'Алгоритмы: введение',
           'Обзор темы перед графами.',
           'Оценка сложности, простые задачи.',
           'beginner',
           'ru',
           70,
           '{
             "modules": [
               {
                 "id": "c080808a-a080-4080-8080-a0808080808a",
                 "courseId": "b8080808-a080-4080-8080-080808080808",
                 "title": "Модуль 1",
                 "description": "Вводный модуль алгоритмов.",
                 "position": 1,
                 "estimatedMinutes": 70,
                 "lessons": [
                   {
                     "id": "e080808a-a080-4080-8080-e0808080808a",
                     "type": "theory",
                     "title": "Сложность и примеры",
                     "position": 1,
                     "estimatedMinutes": 70,
                     "isPreview": true
                   }
                 ]
               }
             ]
           }'::jsonb,
           TRUE,
           TIMESTAMPTZ '2026-04-23 11:45:00+03',
           TIMESTAMPTZ '2026-04-23 11:45:00+03'
       ),
       (
           'b9090909-a090-4090-8090-090909090909',
           '4ddf2ae0-3da9-46c0-a088-a28726f2aff6',
           'Алгоритмы на графах',
           'Обходы, кратчайшие пути — вводный уровень.',
           'Связь с курсом «Алгоритмы: введение» тем же автором.',
           'intermediate',
           'ru',
           110,
           '{
             "modules": [
               {
                 "id": "c090909a-a090-4090-8090-a0909090909a",
                 "courseId": "b9090909-a090-4090-8090-090909090909",
                 "title": "Модуль 1",
                 "description": "Графы.",
                 "position": 1,
                 "estimatedMinutes": 110,
                 "lessons": [
                   {
                     "id": "e090909a-a090-4090-8090-e0909090909a",
                     "type": "theory",
                     "title": "BFS и DFS",
                     "position": 1,
                     "estimatedMinutes": 110,
                     "isPreview": true
                   }
                 ]
               }
             ]
           }'::jsonb,
           TRUE,
           TIMESTAMPTZ '2026-04-23 12:00:00+03',
           TIMESTAMPTZ '2026-04-23 12:00:00+03'
       ),
       (
           'ba0a0a0a-a0a0-40a0-80a0-0a0a0a0a0a0a',
           'ed0bda1c-5f0b-4677-9698-b522b3efacc4',
           'SQL и базы данных для разработчиков',
           'Модели, запросы, индексы — то, что пригодится в работе.',
           'Фокус на PostgreSQL-синтаксисе без углублённого администрирования.',
           'intermediate',
           'ru',
           95,
           '{
             "modules": [
               {
                 "id": "c0a0a0aa-a0a0-40a0-80a0-a0a0a0a0a0aa",
                 "courseId": "ba0a0a0a-a0a0-40a0-80a0-0a0a0a0a0a0a",
                 "title": "Модуль 1",
                 "description": "SQL.",
                 "position": 1,
                 "estimatedMinutes": 95,
                 "lessons": [
                   {
                     "id": "e0a0a0aa-a0a0-40a0-80a0-e0a0a0a0a0aa",
                     "type": "theory",
                     "title": "SELECT и JOIN",
                     "position": 1,
                     "estimatedMinutes": 95,
                     "isPreview": true
                   }
                 ]
               }
             ]
           }'::jsonb,
           TRUE,
           TIMESTAMPTZ '2026-04-23 12:15:00+03',
           TIMESTAMPTZ '2026-04-23 12:15:00+03'
       );

INSERT INTO course_tag (course_id, tag_id)
VALUES ('b1010101-a010-4010-8010-010101010101', 'f3b7f1cf-97f7-4460-8d92-bbc9acd7348b'),
       ('b1010101-a010-4010-8010-010101010101', '3d92fdb9-0db1-43ca-8b8f-f805d5fb4bd9'),
       ('b2020202-a020-4020-8020-020202020202', 'f3b7f1cf-97f7-4460-8d92-bbc9acd7348b'),
       ('b3030303-a030-4030-8030-030303030303', '53a70a48-4985-4298-b9d0-45e7752d25d4'),
       ('b3030303-a030-4030-8030-030303030303', '0e71f8b8-7b0d-48bf-9cef-7a8dd6ae9c39'),
       ('b4040404-a040-4040-8040-040404040404', '53a70a48-4985-4298-b9d0-45e7752d25d4'),
       ('b5050505-a050-4050-8050-050505050505', '53a70a48-4985-4298-b9d0-45e7752d25d4'),
       ('b5050505-a050-4050-8050-050505050505', '0e71f8b8-7b0d-48bf-9cef-7a8dd6ae9c39'),
       ('b6060606-a060-4060-8060-060606060606', '0e71f8b8-7b0d-48bf-9cef-7a8dd6ae9c39'),
       ('b7070707-a070-4070-8070-070707070707', '0e71f8b8-7b0d-48bf-9cef-7a8dd6ae9c39'),
       ('b7070707-a070-4070-8070-070707070707', '3d92fdb9-0db1-43ca-8b8f-f805d5fb4bd9'),
       ('b8080808-a080-4080-8080-080808080808', '3d92fdb9-0db1-43ca-8b8f-f805d5fb4bd9'),
       ('b9090909-a090-4090-8090-090909090909', '3d92fdb9-0db1-43ca-8b8f-f805d5fb4bd9'),
       ('ba0a0a0a-a0a0-40a0-80a0-0a0a0a0a0a0a', '0e71f8b8-7b0d-48bf-9cef-7a8dd6ae9c39');

INSERT INTO lesson_content (lesson_id,
                            course_id,
                            lesson_type,
                            title,
                            content,
                            created_at,
                            updated_at)
VALUES ('e010101a-a010-4010-8010-e0101010101a', 'b1010101-a010-4010-8010-010101010101', 'theory', 'Вводная лекция',
        '{"markdown": "# Добро пожаловать\nКороткое знакомество с курсом."}'::jsonb,
        TIMESTAMPTZ '2026-04-23 10:05:00+03', TIMESTAMPTZ '2026-04-23 10:05:00+03'),
       ('e020202a-a020-4020-8020-e0202020202a', 'b2020202-a020-4020-8020-020202020202', 'theory', 'Коллекции в Java',
        '{"markdown": "# Коллекции\nArrayList, HashSet, HashMap."}'::jsonb,
        TIMESTAMPTZ '2026-04-23 10:20:00+03', TIMESTAMPTZ '2026-04-23 10:20:00+03'),
       ('e030303a-a030-4030-8030-e0303030303a', 'b3030303-a030-4030-8030-030303030303', 'theory',
        'Введение в Spring Security',
        '{"markdown": "# Security\nЦепочка фильтров и базовые концепции."}'::jsonb,
        TIMESTAMPTZ '2026-04-23 10:35:00+03', TIMESTAMPTZ '2026-04-23 10:35:00+03'),
       ('e040404a-a040-4040-8040-e0404040404a', 'b4040404-a040-4040-8040-040404040404', 'theory', 'Обзор паттернов',
        '{"markdown": "# Микросервисы\nОбзор на уровне Spring Boot."}'::jsonb,
        TIMESTAMPTZ '2026-04-23 10:50:00+03', TIMESTAMPTZ '2026-04-23 10:50:00+03'),
       ('e050505a-a050-4050-8050-e0505050505a', 'b5050505-a050-4050-8050-050505050505', 'theory', 'Первая сущность',
        '{"markdown": "# JPA\nEntity и репозиторий."}'::jsonb,
        TIMESTAMPTZ '2026-04-23 11:05:00+03', TIMESTAMPTZ '2026-04-23 11:05:00+03'),
       ('e060606a-a060-4060-8060-e0606060606a', 'b6060606-a060-4060-8060-060606060606', 'theory', 'Что такое Python',
        '{"markdown": "# Python\nСинтаксис и первые программы."}'::jsonb,
        TIMESTAMPTZ '2026-04-23 11:20:00+03', TIMESTAMPTZ '2026-04-23 11:20:00+03'),
       ('e070707a-a070-4070-8070-e0707070707a', 'b7070707-a070-4070-8070-070707070707', 'theory', 'Структуры данных',
        '{"markdown": "# Python\nlist, dict, set."}'::jsonb,
        TIMESTAMPTZ '2026-04-23 11:35:00+03', TIMESTAMPTZ '2026-04-23 11:35:00+03'),
       ('e080808a-a080-4080-8080-e0808080808a', 'b8080808-a080-4080-8080-080808080808', 'theory', 'Сложность и примеры',
        '{"markdown": "# Алгоритмы\nO-нотация."}'::jsonb,
        TIMESTAMPTZ '2026-04-23 11:50:00+03', TIMESTAMPTZ '2026-04-23 11:50:00+03'),
       ('e090909a-a090-4090-8090-e0909090909a', 'b9090909-a090-4090-8090-090909090909', 'theory', 'BFS и DFS',
        '{"markdown": "# Графы\nОбход в ширину и глубину."}'::jsonb,
        TIMESTAMPTZ '2026-04-23 12:05:00+03', TIMESTAMPTZ '2026-04-23 12:05:00+03'),
       ('e0a0a0aa-a0a0-40a0-80a0-e0a0a0a0a0aa', 'ba0a0a0a-a0a0-40a0-80a0-0a0a0a0a0a0a', 'theory', 'SELECT и JOIN',
        '{"markdown": "# SQL\nБазовые запросы."}'::jsonb,
        TIMESTAMPTZ '2026-04-23 12:20:00+03', TIMESTAMPTZ '2026-04-23 12:20:00+03');

