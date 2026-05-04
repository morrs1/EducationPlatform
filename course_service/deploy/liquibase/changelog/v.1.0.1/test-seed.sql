--liquibase formatted sql

--changeset morrs:course-service-test-seed

INSERT INTO tag (id, name)
VALUES ('f3b7f1cf-97f7-4460-8d92-bbc9acd7348b', 'java'),
       ('0e71f8b8-7b0d-48bf-9cef-7a8dd6ae9c39', 'backend'),
       ('3d92fdb9-0db1-43ca-8b8f-f805d5fb4bd9', 'algorithms'),
       ('53a70a48-4985-4298-b9d0-45e7752d25d4', 'spring'),
       ('64b5f77d-1986-4e80-9195-1cbdb5601201', 'python'),
       ('75c6a88e-2a97-4f91-a2a6-2dcec6712302', 'javascript'),
       ('86d7b99f-3ba8-40a2-b3b7-3edfd7823403', 'frontend');

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
       ),
       (
           'a1d7a9c0-7e9f-4c11-9cb2-4f4f62e58f11',
           '909262ef-d229-47aa-8fdd-8c3f93adfd5d',
           'Python для автоматизации и обработки данных',
           'Практический курс по Python: от синтаксиса до небольших ETL и скриптов автоматизации.',
           'Курс помогает уверенно писать прикладной Python-код: разбирать данные, работать с файлами и HTTP API, собирать небольшие автоматизации и оформлять их как понятные инженерные решения.',
           'beginner',
           'ru',
           185,
           '{
             "modules": [
               {
                 "id": "b4f0e1c5-3bc0-4f68-8e84-9e40d70eb101",
                 "courseId": "a1d7a9c0-7e9f-4c11-9cb2-4f4f62e58f11",
                 "title": "Синтаксис, функции и коллекции",
                 "description": "Разбираем читаемый Python-код, функции и основные структуры данных.",
                 "position": 1,
                 "estimatedMinutes": 95,
                 "lessons": [
                   {
                     "id": "d1aa4104-3137-4f8c-9d96-807a13d11101",
                     "type": "theory",
                     "title": "Синтаксис Python, переменные и функции",
                     "position": 1,
                     "estimatedMinutes": 25,
                     "isPreview": true
                   },
                   {
                     "id": "e2bb5205-4248-4a9d-8e97-918b24e22202",
                     "type": "quiz",
                     "title": "Квиз: базовые конструкции Python",
                     "position": 2,
                     "estimatedMinutes": 20,
                     "isPreview": false
                   },
                   {
                     "id": "f3cc6306-5359-4bad-9f98-a29c35f33303",
                     "type": "coding",
                     "title": "Практика: обработка списка заказов",
                     "position": 3,
                     "estimatedMinutes": 50,
                     "isPreview": false
                   }
                 ]
               },
               {
                 "id": "c5239ee8-6b5a-4f2a-9cb2-3158e2f3c102",
                 "courseId": "a1d7a9c0-7e9f-4c11-9cb2-4f4f62e58f11",
                 "title": "Файлы, JSON и внешние данные",
                 "description": "Учимся забирать данные, перекладывать их между форматами и собирать мини-ETL.",
                 "position": 2,
                 "estimatedMinutes": 90,
                 "lessons": [
                   {
                     "id": "a4dd7407-646a-4cbe-8aa9-b3ad46f44404",
                     "type": "theory",
                     "title": "Файлы, JSON и HTTP-запросы",
                     "position": 1,
                     "estimatedMinutes": 30,
                     "isPreview": false
                   },
                   {
                     "id": "b5ee8508-757b-4dcf-9bba-c4be57f55505",
                     "type": "coding",
                     "title": "Практика: мини-ETL из API в CSV",
                     "position": 2,
                     "estimatedMinutes": 60,
                     "isPreview": false
                   }
                 ]
               }
             ]
           }'::jsonb,
           TIMESTAMPTZ '2026-04-23 10:00:00+03',
           TIMESTAMPTZ '2026-04-23 10:00:00+03'
       ),
       (
           '7c3d5f11-2e0b-4b1c-8cb7-6e1a9f4d2201',
           '909262ef-d229-47aa-8fdd-8c3f93adfd5d',
           'Java: ООП, коллекции и сервисный код',
           'Осмысленный Java-курс про архитектуру доменной модели, коллекции, Stream API и прикладные задачи.',
           'Курс собирает вместе Java Core, прикладное ООП и сервисную разработку: от инкапсуляции и generics до потоковой обработки данных, ошибок и небольших инженерных упражнений с понятным контекстом.',
           'intermediate',
           'ru',
           205,
           '{
             "modules": [
               {
                 "id": "8d4e6012-3f1c-4c2d-9dc8-7f2ba05e3301",
                 "courseId": "7c3d5f11-2e0b-4b1c-8cb7-6e1a9f4d2201",
                 "title": "ООП, интерфейсы и доменная модель",
                 "description": "Учимся проектировать классы, интерфейсы и коллекции без хаоса в коде.",
                 "position": 1,
                 "estimatedMinutes": 110,
                 "lessons": [
                   {
                     "id": "af607214-512e-4e4f-bfea-914dc2705501",
                     "type": "theory",
                     "title": "ООП, интерфейсы и generics",
                     "position": 1,
                     "estimatedMinutes": 30,
                     "isPreview": true
                   },
                   {
                     "id": "b0718315-623f-4f50-80fb-a25ed3816602",
                     "type": "quiz",
                     "title": "Квиз: коллекции и контракт equals/hashCode",
                     "position": 2,
                     "estimatedMinutes": 20,
                     "isPreview": false
                   },
                   {
                     "id": "c1829416-7340-4051-810c-b36fe4927703",
                     "type": "coding",
                     "title": "Практика: каталог книг и поиск по тегам",
                     "position": 3,
                     "estimatedMinutes": 60,
                     "isPreview": false
                   }
                 ]
               },
               {
                 "id": "9e5f7113-401d-4d3e-aed9-803cb16f4402",
                 "courseId": "7c3d5f11-2e0b-4b1c-8cb7-6e1a9f4d2201",
                 "title": "Stream API, ошибки и отчёты",
                 "description": "Переходим к потоковым преобразованиям, Optional и работе с прикладными отчётами.",
                 "position": 2,
                 "estimatedMinutes": 95,
                 "lessons": [
                   {
                     "id": "d293a517-8451-4152-a21d-c470f5a38804",
                     "type": "theory",
                     "title": "Stream API, Optional и обработка ошибок",
                     "position": 1,
                     "estimatedMinutes": 35,
                     "isPreview": false
                   },
                   {
                     "id": "e3a4b618-9562-4253-b32e-d58106b49905",
                     "type": "coding",
                     "title": "Практика: отчёт по заказам со Stream API",
                     "position": 2,
                     "estimatedMinutes": 60,
                     "isPreview": false
                   }
                 ]
               }
             ]
           }'::jsonb,
           TIMESTAMPTZ '2026-04-23 11:00:00+03',
           TIMESTAMPTZ '2026-04-23 11:00:00+03'
       ),
       (
           '3f8d0c21-54a7-4d41-9e3d-1c2b7a9f8801',
           '909262ef-d229-47aa-8fdd-8c3f93adfd5d',
           'JavaScript для интерактивных интерфейсов',
           'Курс про современный JavaScript, DOM, события, асинхронность и сборку небольших UI-сценариев.',
           'Курс показывает, как из базового JavaScript переходить к интерфейсной логике: управлять DOM, понимать жизненный цикл событий, работать с fetch и строить небольшие пользовательские сценарии без магии.',
           'beginner',
           'ru',
           190,
           '{
             "modules": [
               {
                 "id": "4a9e1d22-65b8-4e52-af4e-2d3c8ba09901",
                 "courseId": "3f8d0c21-54a7-4d41-9e3d-1c2b7a9f8801",
                 "title": "База JavaScript и DOM",
                 "description": "Закладываем основу: переменные, функции, массивы и интерактивность через DOM.",
                 "position": 1,
                 "estimatedMinutes": 100,
                 "lessons": [
                   {
                     "id": "6cbe3f24-87da-4074-8160-4f5eadc2bb01",
                     "type": "theory",
                     "title": "Переменные, функции и DOM-события",
                     "position": 1,
                     "estimatedMinutes": 25,
                     "isPreview": true
                   },
                   {
                     "id": "7dcf4025-98eb-4175-8271-506fbed3cc02",
                     "type": "quiz",
                     "title": "Квиз: область видимости и работа с DOM",
                     "position": 2,
                     "estimatedMinutes": 20,
                     "isPreview": false
                   },
                   {
                     "id": "8ed05126-a9fc-4276-a382-6170cfe4dd03",
                     "type": "coding",
                     "title": "Практика: список задач с фильтрацией",
                     "position": 3,
                     "estimatedMinutes": 55,
                     "isPreview": false
                   }
                 ]
               },
               {
                 "id": "5bad2e23-76c9-4f63-b05f-3e4d9cb1aa02",
                 "courseId": "3f8d0c21-54a7-4d41-9e3d-1c2b7a9f8801",
                 "title": "Асинхронность и состояние интерфейса",
                 "description": "Учимся загружать данные, синхронизировать экран и не терять контроль над состоянием.",
                 "position": 2,
                 "estimatedMinutes": 90,
                 "lessons": [
                   {
                     "id": "9fe16227-b10d-4377-b493-7281d0f5ee04",
                     "type": "theory",
                     "title": "Promise, fetch и управление состоянием интерфейса",
                     "position": 1,
                     "estimatedMinutes": 30,
                     "isPreview": false
                   },
                   {
                     "id": "a0f27328-c21e-4478-85a4-8392e106ff05",
                     "type": "coding",
                     "title": "Практика: экран каталога с асинхронной загрузкой",
                     "position": 2,
                     "estimatedMinutes": 60,
                     "isPreview": false
                   }
                 ]
               }
             ]
           }'::jsonb,
           TIMESTAMPTZ '2026-04-23 12:00:00+03',
           TIMESTAMPTZ '2026-04-23 12:00:00+03'
       );

INSERT INTO course_tag (course_id, tag_id)
VALUES ('4ec4e0ea-2d8f-4a55-b7d2-7be0b85d75d8', 'f3b7f1cf-97f7-4460-8d92-bbc9acd7348b'),
       ('4ec4e0ea-2d8f-4a55-b7d2-7be0b85d75d8', '0e71f8b8-7b0d-48bf-9cef-7a8dd6ae9c39'),
       ('4ec4e0ea-2d8f-4a55-b7d2-7be0b85d75d8', '3d92fdb9-0db1-43ca-8b8f-f805d5fb4bd9'),
       ('51652887-b537-468f-91e0-bc4ee1ddb4fd', '0e71f8b8-7b0d-48bf-9cef-7a8dd6ae9c39'),
       ('51652887-b537-468f-91e0-bc4ee1ddb4fd', '53a70a48-4985-4298-b9d0-45e7752d25d4'),
       ('51652887-b537-468f-91e0-bc4ee1ddb4fd', 'f3b7f1cf-97f7-4460-8d92-bbc9acd7348b'),
       ('a1d7a9c0-7e9f-4c11-9cb2-4f4f62e58f11', '64b5f77d-1986-4e80-9195-1cbdb5601201'),
       ('a1d7a9c0-7e9f-4c11-9cb2-4f4f62e58f11', '0e71f8b8-7b0d-48bf-9cef-7a8dd6ae9c39'),
       ('7c3d5f11-2e0b-4b1c-8cb7-6e1a9f4d2201', 'f3b7f1cf-97f7-4460-8d92-bbc9acd7348b'),
       ('7c3d5f11-2e0b-4b1c-8cb7-6e1a9f4d2201', '0e71f8b8-7b0d-48bf-9cef-7a8dd6ae9c39'),
       ('7c3d5f11-2e0b-4b1c-8cb7-6e1a9f4d2201', '3d92fdb9-0db1-43ca-8b8f-f805d5fb4bd9'),
       ('3f8d0c21-54a7-4d41-9e3d-1c2b7a9f8801', '75c6a88e-2a97-4f91-a2a6-2dcec6712302'),
       ('3f8d0c21-54a7-4d41-9e3d-1c2b7a9f8801', '86d7b99f-3ba8-40a2-b3b7-3edfd7823403');

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
       ),
       (
           'd1aa4104-3137-4f8c-9d96-807a13d11101',
           'a1d7a9c0-7e9f-4c11-9cb2-4f4f62e58f11',
           'theory',
           'Синтаксис Python, переменные и функции',
           '{
             "markdown": "# Python: переменные, функции и коллекции\nPython ценят за читаемость, быстрый цикл проверки гипотез и богатую экосистему. В этом уроке мы собираем фундамент, на котором позже строятся автоматизация, обработка данных и небольшие сервисные скрипты.\n\n## Что важно понять\n- как называть переменные и не терять смысл кода;\n- когда выносить логику в функцию;\n- чем `list`, `tuple`, `dict` и `set` отличаются по роли в программе.\n\n```python\nfrom decimal import Decimal\n\ndef normalize_price(value: str) -> Decimal:\n    return Decimal(value).quantize(Decimal(\"0.01\"))\n```\n\nХороший Python-код короткий не сам по себе, а потому что каждая строка делает одну понятную вещь."
           }'::jsonb,
           TIMESTAMPTZ '2026-04-23 10:00:00+03',
           TIMESTAMPTZ '2026-04-23 10:00:00+03'
       ),
       (
           'e2bb5205-4248-4a9d-8e97-918b24e22202',
           'a1d7a9c0-7e9f-4c11-9cb2-4f4f62e58f11',
           'quiz',
           'Квиз: базовые конструкции Python',
           '{
             "introMarkdown": "## Проверяем основы Python\nВопросы собраны так, чтобы закрепить синтаксис, коллекции и базовые функции стандартной библиотеки.",
             "questions": [
               {
                 "id": "f16ab8f1-6f42-4d43-9b11-111111111111",
                 "type": "single_choice",
                 "text": "Что вернёт выражение `len({\"a\": 1, \"b\": 2})`?",
                 "options": [
                   {
                     "id": "f16ab8f1-6f42-4d43-9b11-111111111112",
                     "text": "2",
                     "isCorrect": true
                   },
                   {
                     "id": "f16ab8f1-6f42-4d43-9b11-111111111113",
                     "text": "1",
                     "isCorrect": false
                   },
                   {
                     "id": "f16ab8f1-6f42-4d43-9b11-111111111114",
                     "text": "Ошибка, потому что это словарь",
                     "isCorrect": false
                   }
                 ]
               },
               {
                 "id": "f16ab8f1-6f42-4d43-9b11-111111111115",
                 "type": "multiple_choice",
                 "text": "Какие выражения создают изменяемую коллекцию?",
                 "options": [
                   {
                     "id": "f16ab8f1-6f42-4d43-9b11-111111111116",
                     "text": "[]",
                     "isCorrect": true
                   },
                   {
                     "id": "f16ab8f1-6f42-4d43-9b11-111111111117",
                     "text": "list()",
                     "isCorrect": true
                   },
                   {
                     "id": "f16ab8f1-6f42-4d43-9b11-111111111118",
                     "text": "()",
                     "isCorrect": false
                   },
                   {
                     "id": "f16ab8f1-6f42-4d43-9b11-111111111119",
                     "text": "frozenset()",
                     "isCorrect": false
                   }
                 ]
               },
               {
                 "id": "f16ab8f1-6f42-4d43-9b11-111111111120",
                 "type": "single_choice",
                 "text": "Какое ключевое слово используется для возврата значения из функции?",
                 "options": [
                   {
                     "id": "f16ab8f1-6f42-4d43-9b11-111111111121",
                     "text": "yield",
                     "isCorrect": false
                   },
                   {
                     "id": "f16ab8f1-6f42-4d43-9b11-111111111122",
                     "text": "return",
                     "isCorrect": true
                   },
                   {
                     "id": "f16ab8f1-6f42-4d43-9b11-111111111123",
                     "text": "pass",
                     "isCorrect": false
                   }
                 ]
               }
             ]
           }'::jsonb,
           TIMESTAMPTZ '2026-04-23 10:10:00+03',
           TIMESTAMPTZ '2026-04-23 10:10:00+03'
       ),
       (
           'f3cc6306-5359-4bad-9f98-a29c35f33303',
           'a1d7a9c0-7e9f-4c11-9cb2-4f4f62e58f11',
           'coding',
           'Практика: обработка списка заказов',
           '{
             "taskMarkdown": "## Задача\nВ первой строке приходит число `n` — количество заказов. Далее следуют `n` строк с количеством и ценой позиции: `quantity price`.\n\nНужно посчитать общую выручку и вывести её как целое число. Это упражнение проверяет умение читать входные данные, хранить промежуточный результат и аккуратно разбивать код на маленькие функции.",
             "checkerType": "stdin_stdout",
             "languages": [
               {
                 "language": "python",
                 "starterCode": "def parse_order(line: str) -> tuple[int, int]:\n    quantity, price = map(int, line.split())\n    return quantity, price\n\n\ndef main() -> None:\n    n = int(input())\n    total = 0\n    for _ in range(n):\n        quantity, price = parse_order(input())\n        total += quantity * price\n    print(total)\n\n\nif __name__ == \"__main__\":\n    main()\n"
               }
             ],
             "testCases": [
               {
                 "id": "1f7b9c21-98cf-4c59-8ab1-222222222221",
                 "isPublic": true,
                 "input": "3\n2 100\n1 350\n4 25\n",
                 "expectedOutput": "650\n"
               },
               {
                 "id": "1f7b9c21-98cf-4c59-8ab1-222222222222",
                 "isPublic": false,
                 "input": "2\n10 15\n3 200\n",
                 "expectedOutput": "750\n"
               }
             ]
           }'::jsonb,
           TIMESTAMPTZ '2026-04-23 10:20:00+03',
           TIMESTAMPTZ '2026-04-23 10:20:00+03'
       ),
       (
           'a4dd7407-646a-4cbe-8aa9-b3ad46f44404',
           'a1d7a9c0-7e9f-4c11-9cb2-4f4f62e58f11',
           'theory',
           'Файлы, JSON и HTTP-запросы',
           '{
             "markdown": "# Файлы, JSON и HTTP-запросы\nРеальные Python-скрипты редко живут в вакууме. Обычно они читают CSV или JSON, идут за дополнительными данными в API и собирают новый артефакт для команды или бизнеса.\n\n## Рабочий цикл инженера\n1. Прочитать структуру входных данных.\n2. Преобразовать значения в доменную модель.\n3. Забрать обогащение из внешнего API.\n4. Записать результат в новый формат.\n\n```python\nimport csv\nimport requests\n\nresponse = requests.get(\"https://example.com/api/orders\", timeout=5)\norders = response.json()\n\nwith open(\"orders.csv\", \"w\", newline=\"\", encoding=\"utf-8\") as file:\n    writer = csv.DictWriter(file, fieldnames=[\"id\", \"status\", \"total\"])\n    writer.writeheader()\n    writer.writerows(orders)\n```\n\nВажнее всего не количество библиотек, а прозрачность конвейера: откуда пришли данные, как они были изменены и куда записались."
           }'::jsonb,
           TIMESTAMPTZ '2026-04-23 10:35:00+03',
           TIMESTAMPTZ '2026-04-23 10:35:00+03'
       ),
       (
           'b5ee8508-757b-4dcf-9bba-c4be57f55505',
           'a1d7a9c0-7e9f-4c11-9cb2-4f4f62e58f11',
           'coding',
           'Практика: мини-ETL из API в CSV',
           '{
             "taskMarkdown": "## Задача\nНужно описать скрипт, который получает список задач из HTTP API, фильтрует только активные записи и выгружает их в CSV с колонками `id`, `title`, `status`.\n\nОценивается структура решения: функции, обработка ошибок, работа с `requests`, сериализация в CSV и понятный сценарий запуска.",
             "checkerType": "manual_review",
             "languages": [
               {
                 "language": "python",
                 "starterCode": "import csv\nimport requests\n\nAPI_URL = \"https://example.com/api/tasks\"\nOUTPUT_FILE = \"tasks.csv\"\n\n\ndef fetch_tasks() -> list[dict]:\n    raise NotImplementedError\n\n\ndef export_tasks(rows: list[dict]) -> None:\n    raise NotImplementedError\n\n\nif __name__ == \"__main__\":\n    tasks = fetch_tasks()\n    export_tasks(tasks)\n"
               }
             ],
             "testCases": [
               {
                 "id": "2a8cad32-a9d0-4d6a-9bc2-333333333331",
                 "isPublic": true,
                 "input": "HTTP GET -> JSON list",
                 "expectedOutput": "CSV with active rows only"
               }
             ]
           }'::jsonb,
           TIMESTAMPTZ '2026-04-23 10:50:00+03',
           TIMESTAMPTZ '2026-04-23 10:50:00+03'
       ),
       (
           'af607214-512e-4e4f-bfea-914dc2705501',
           '7c3d5f11-2e0b-4b1c-8cb7-6e1a9f4d2201',
           'theory',
           'ООП, интерфейсы и generics',
           '{
             "markdown": "# ООП, интерфейсы и generics\nХороший Java-код начинается не с аннотаций, а с доменной модели. Если классы и интерфейсы описывают реальный смысл предметной области, то сервисный слой становится проще, а тесты — короче.\n\n## В фокусе урока\n- инкапсуляция и границы ответственности;\n- интерфейс как контракт, а не формальность;\n- generics как способ писать повторно используемый код без потери типов.\n\n```java\npublic interface PricePolicy<T> {\n    BigDecimal calculate(T source);\n}\n```\n\nКогда модель выразительная, коллекции и сервисы начинают работать на тебя, а не против тебя."
           }'::jsonb,
           TIMESTAMPTZ '2026-04-23 11:00:00+03',
           TIMESTAMPTZ '2026-04-23 11:00:00+03'
       ),
       (
           'b0718315-623f-4f50-80fb-a25ed3816602',
           '7c3d5f11-2e0b-4b1c-8cb7-6e1a9f4d2201',
           'quiz',
           'Квиз: коллекции и контракт equals/hashCode',
           '{
             "introMarkdown": "## Разбираем подводные камни Java Core\nВопросы про коллекции, контракты объектов и типичные ошибки сервисного кода.",
             "questions": [
               {
                 "id": "3b9dbe43-bae1-4e7b-acd3-444444444441",
                 "type": "single_choice",
                 "text": "Почему для объектов, которые хранятся в `HashSet`, важно корректно переопределять `equals` и `hashCode`?",
                 "options": [
                   {
                     "id": "3b9dbe43-bae1-4e7b-acd3-444444444442",
                     "text": "Иначе set не сможет корректно искать и устранять дубликаты",
                     "isCorrect": true
                   },
                   {
                     "id": "3b9dbe43-bae1-4e7b-acd3-444444444443",
                     "text": "Иначе код не скомпилируется",
                     "isCorrect": false
                   }
                 ]
               },
               {
                 "id": "3b9dbe43-bae1-4e7b-acd3-444444444444",
                 "type": "multiple_choice",
                 "text": "Какие коллекции сохраняют порядок добавления элементов?",
                 "options": [
                   {
                     "id": "3b9dbe43-bae1-4e7b-acd3-444444444445",
                     "text": "ArrayList",
                     "isCorrect": true
                   },
                   {
                     "id": "3b9dbe43-bae1-4e7b-acd3-444444444446",
                     "text": "LinkedHashSet",
                     "isCorrect": true
                   },
                   {
                     "id": "3b9dbe43-bae1-4e7b-acd3-444444444447",
                     "text": "HashSet",
                     "isCorrect": false
                   },
                   {
                     "id": "3b9dbe43-bae1-4e7b-acd3-444444444448",
                     "text": "HashMap keys by default preserve insertion order",
                     "isCorrect": false
                   }
                 ]
               }
             ]
           }'::jsonb,
           TIMESTAMPTZ '2026-04-23 11:12:00+03',
           TIMESTAMPTZ '2026-04-23 11:12:00+03'
       ),
       (
           'c1829416-7340-4051-810c-b36fe4927703',
           '7c3d5f11-2e0b-4b1c-8cb7-6e1a9f4d2201',
           'coding',
           'Практика: каталог книг и поиск по тегам',
           '{
             "taskMarkdown": "## Задача\nСпроектируйте небольшой каталог книг. У каждой книги есть идентификатор, название, набор тегов и статус публикации. Нужно реализовать сервис поиска по тегу и метод, который возвращает только опубликованные книги.\n\nЗдесь важна не только компиляция, но и качество модели: сущности, интерфейсы, коллекции и читаемые имена.",
             "checkerType": "manual_review",
             "languages": [
               {
                 "language": "java",
                 "starterCode": "public record Book(String id, String title, java.util.Set<String> tags, boolean published) {}\n\npublic interface BookCatalog {\n    java.util.List<Book> findPublishedByTag(String tag);\n}\n"
               }
             ],
             "testCases": [
               {
                 "id": "4cadcf54-cbf2-4f8c-bde4-555555555551",
                 "isPublic": true,
                 "input": "tag=backend",
                 "expectedOutput": "list of published books that contain backend"
               }
             ]
           }'::jsonb,
           TIMESTAMPTZ '2026-04-23 11:25:00+03',
           TIMESTAMPTZ '2026-04-23 11:25:00+03'
       ),
       (
           'd293a517-8451-4152-a21d-c470f5a38804',
           '7c3d5f11-2e0b-4b1c-8cb7-6e1a9f4d2201',
           'theory',
           'Stream API, Optional и обработка ошибок',
           '{
             "markdown": "# Stream API, Optional и обработка ошибок\nКогда доменная модель уже в порядке, следующая задача — уметь быстро агрегировать данные и не терять качество кода. Stream API помогает описывать преобразования декларативно, а `Optional` и понятные исключения делают сценарии отказа прозрачнее.\n\n```java\nBigDecimal total = orders.stream()\n        .filter(Order::isPaid)\n        .map(Order::amount)\n        .reduce(BigDecimal.ZERO, BigDecimal::add);\n```\n\nИспользуйте потоковые операции там, где они делают код короче и яснее. Если условие становится запутанным, обычный цикл по-прежнему нормальный выбор."
           }'::jsonb,
           TIMESTAMPTZ '2026-04-23 11:40:00+03',
           TIMESTAMPTZ '2026-04-23 11:40:00+03'
       ),
       (
           'e3a4b618-9562-4253-b32e-d58106b49905',
           '7c3d5f11-2e0b-4b1c-8cb7-6e1a9f4d2201',
           'coding',
           'Практика: отчёт по заказам со Stream API',
           '{
             "taskMarkdown": "## Задача\nВ первой строке приходит число `n`, далее `n` строк формата `client amount paid`, где `paid` — `true` или `false`.\n\nНужно посчитать сумму только оплаченных заказов и вывести её как целое число. Задание проверяет чтение данных, преобразование строк и аккуратное использование Stream API.",
             "checkerType": "stdin_stdout",
             "languages": [
               {
                 "language": "java",
                 "starterCode": "import java.io.BufferedReader;\nimport java.io.IOException;\nimport java.io.InputStreamReader;\nimport java.util.ArrayList;\nimport java.util.List;\n\npublic class Main {\n    record Order(String client, int amount, boolean paid) {}\n\n    public static void main(String[] args) throws Exception {\n        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));\n        int n = Integer.parseInt(reader.readLine());\n        List<Order> orders = new ArrayList<>();\n        for (int i = 0; i < n; i++) {\n            String[] parts = reader.readLine().split(\" \");\n            orders.add(new Order(parts[0], Integer.parseInt(parts[1]), Boolean.parseBoolean(parts[2])));\n        }\n        int total = orders.stream().filter(Order::paid).mapToInt(Order::amount).sum();\n        System.out.println(total);\n    }\n}\n"
               }
             ],
             "testCases": [
               {
                 "id": "5dbed065-dc03-409d-bef5-666666666661",
                 "isPublic": true,
                 "input": "4\nalice 120 true\nbob 80 false\nclaire 150 true\ndan 50 false\n",
                 "expectedOutput": "270\n"
               },
               {
                 "id": "5dbed065-dc03-409d-bef5-666666666662",
                 "isPublic": false,
                 "input": "3\nneo 100 true\ntrinity 100 true\nmorpheus 90 true\n",
                 "expectedOutput": "290\n"
               }
             ]
           }'::jsonb,
           TIMESTAMPTZ '2026-04-23 11:55:00+03',
           TIMESTAMPTZ '2026-04-23 11:55:00+03'
       ),
       (
           '6cbe3f24-87da-4074-8160-4f5eadc2bb01',
           '3f8d0c21-54a7-4d41-9e3d-1c2b7a9f8801',
           'theory',
           'Переменные, функции и DOM-события',
           '{
             "markdown": "# Переменные, функции и DOM-события\nJavaScript становится по-настоящему полезным, когда начинает управлять интерфейсом. Для этого нужны не только `let` и `const`, но и понимание событий, слушателей и структуры документа.\n\n## На что смотрим\n- как хранить состояние небольшого виджета;\n- как декомпозировать обработчики событий;\n- почему прямые манипуляции с DOM быстро превращаются в хаос без структуры.\n\n```javascript\nconst button = document.querySelector(\"[data-save]\");\nbutton.addEventListener(\"click\", () => {\n  console.log(\"draft saved\");\n});\n```\n\nЧем раньше вы начнёте отделять данные от визуального слоя, тем легче будет расти интерфейсу."
           }'::jsonb,
           TIMESTAMPTZ '2026-04-23 12:00:00+03',
           TIMESTAMPTZ '2026-04-23 12:00:00+03'
       ),
       (
           '7dcf4025-98eb-4175-8271-506fbed3cc02',
           '3f8d0c21-54a7-4d41-9e3d-1c2b7a9f8801',
           'quiz',
           'Квиз: область видимости и работа с DOM',
           '{
             "introMarkdown": "## Проверяем фундамент фронтенд-разработки\nНиже вопросы про область видимости, DOM API и обработку событий.",
             "questions": [
               {
                 "id": "6ecfe176-ed14-41ae-bf06-777777777771",
                 "type": "single_choice",
                 "text": "Какой метод возвращает первый элемент, соответствующий CSS-селектору?",
                 "options": [
                   {
                     "id": "6ecfe176-ed14-41ae-bf06-777777777772",
                     "text": "document.querySelector()",
                     "isCorrect": true
                   },
                   {
                     "id": "6ecfe176-ed14-41ae-bf06-777777777773",
                     "text": "document.find()",
                     "isCorrect": false
                   }
                 ]
               },
               {
                 "id": "6ecfe176-ed14-41ae-bf06-777777777774",
                 "type": "multiple_choice",
                 "text": "Какие утверждения про `let` корректны?",
                 "options": [
                   {
                     "id": "6ecfe176-ed14-41ae-bf06-777777777775",
                     "text": "Переменная имеет блочную область видимости",
                     "isCorrect": true
                   },
                   {
                     "id": "6ecfe176-ed14-41ae-bf06-777777777776",
                     "text": "Переменную можно объявить до использования без ограничений за счёт hoisting",
                     "isCorrect": false
                   },
                   {
                     "id": "6ecfe176-ed14-41ae-bf06-777777777777",
                     "text": "Значение можно переопределить после объявления",
                     "isCorrect": true
                   }
                 ]
               }
             ]
           }'::jsonb,
           TIMESTAMPTZ '2026-04-23 12:10:00+03',
           TIMESTAMPTZ '2026-04-23 12:10:00+03'
       ),
       (
           '8ed05126-a9fc-4276-a382-6170cfe4dd03',
           '3f8d0c21-54a7-4d41-9e3d-1c2b7a9f8801',
           'coding',
           'Практика: список задач с фильтрацией',
           '{
             "taskMarkdown": "## Задача\nСоберите небольшой интерфейс списка задач. Пользователь должен уметь добавлять задачу, отмечать её выполненной и фильтровать список по статусу.\n\nПроверяем структуру функций, работу с DOM, делегирование событий и аккуратное хранение состояния.",
             "checkerType": "manual_review",
             "languages": [
               {
                 "language": "javascript",
                 "starterCode": "const state = {\n  tasks: [],\n  filter: \"all\",\n};\n\nfunction render() {\n  // update DOM\n}\n\nfunction addTask(title) {\n  // push task into state and rerender\n}\n"
               }
             ],
             "testCases": [
               {
                 "id": "7fdf0287-fe25-42bf-c017-888888888881",
                 "isPublic": true,
                 "input": "Add two tasks, mark one as done, switch filter to active",
                 "expectedOutput": "Only unfinished task remains visible"
               }
             ]
           }'::jsonb,
           TIMESTAMPTZ '2026-04-23 12:25:00+03',
           TIMESTAMPTZ '2026-04-23 12:25:00+03'
       ),
       (
           '9fe16227-b10d-4377-b493-7281d0f5ee04',
           '3f8d0c21-54a7-4d41-9e3d-1c2b7a9f8801',
           'theory',
           'Promise, fetch и управление состоянием интерфейса',
           '{
             "markdown": "# Promise, fetch и управление состоянием интерфейса\nКак только интерфейс начинает ждать данные с сервера, у приложения появляется дополнительное состояние: загрузка, успех, ошибка, повтор запроса. Умение явно моделировать эти фазы — ключ к предсказуемому фронтенду.\n\n```javascript\nasync function loadCourses() {\n  const response = await fetch(\"/api/courses\");\n  if (!response.ok) {\n    throw new Error(\"Failed to load courses\");\n  }\n  return response.json();\n}\n```\n\nНеважно, работаете вы на чистом JavaScript или в React: пользователь всегда должен понимать, что происходит на экране прямо сейчас."
           }'::jsonb,
           TIMESTAMPTZ '2026-04-23 12:40:00+03',
           TIMESTAMPTZ '2026-04-23 12:40:00+03'
       ),
       (
           'a0f27328-c21e-4478-85a4-8392e106ff05',
           '3f8d0c21-54a7-4d41-9e3d-1c2b7a9f8801',
           'coding',
           'Практика: экран каталога с асинхронной загрузкой',
           '{
             "taskMarkdown": "## Задача\nСоберите экран каталога, который при открытии загружает список курсов, показывает состояние `loading`, умеет отрисовать ошибку и обновляет интерфейс после успешного ответа.\n\nВажно продумать структуру состояния и способ рендера, а не только сам вызов `fetch`.",
             "checkerType": "manual_review",
             "languages": [
               {
                 "language": "javascript",
                 "starterCode": "const state = {\n  status: \"idle\",\n  items: [],\n  error: \"\",\n};\n\nasync function loadCatalog() {\n  state.status = \"loading\";\n  render();\n}\n\nfunction render() {\n  // draw loading, error or list\n}\n"
               }
             ],
             "testCases": [
               {
                 "id": "80e01398-0f36-43c0-d128-999999999991",
                 "isPublic": true,
                 "input": "status=loading -> success -> error",
                 "expectedOutput": "Screen reflects each state explicitly"
               }
             ]
           }'::jsonb,
           TIMESTAMPTZ '2026-04-23 12:55:00+03',
           TIMESTAMPTZ '2026-04-23 12:55:00+03'
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

