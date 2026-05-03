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


