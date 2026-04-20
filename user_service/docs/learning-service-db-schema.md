# Схема БД для learning-service

## Назначение
`learning-service` хранит:
- факт записи пользователя на курс
- прогресс пользователя по курсу
- прогресс по модулям
- прогресс по урокам
- сертификат по завершённому курсу

Сервис **не** хранит полные данные пользователя и курса как источник истины.
Он хранит только сокращённые локальные проекции для проверки существования сущностей и для быстрых чтений.

## Таблицы

### `user_ref`
Локальная проекция пользователя.

Поля:
- `id uuid primary key`
- `status varchar(32) not null` (`active`, `blocked`, `deleted`)
- `display_name varchar(255)`
- `updated_at timestamptz not null default now()`

### `course_ref`
Локальная проекция курса.

Поля:
- `id uuid primary key`
- `title varchar(255) not null`
- `status varchar(32) not null` (`draft`, `published`, `archived`)
- `total_modules integer not null default 0`
- `total_lessons integer not null default 0`
- `updated_at timestamptz not null default now()`

### `module_ref`
Локальная проекция модуля курса.

Поля:
- `id uuid primary key`
- `course_id uuid not null references course_ref(id)`
- `title varchar(255) not null`
- `position integer not null`
- `total_lessons integer not null default 0`
- `updated_at timestamptz not null default now()`

Ограничения:
- `unique (course_id, position)`

### `lesson_ref`
Локальная проекция урока.

Поля:
- `id uuid primary key`
- `course_id uuid not null references course_ref(id)`
- `module_id uuid references module_ref(id)`
- `title varchar(255) not null`
- `position integer not null`
- `lesson_type varchar(32) not null` (`theory`, `quiz`, `coding`)
- `is_required boolean not null default true`
- `updated_at timestamptz not null default now()`

Ограничения:
- `unique (course_id, position)`

### `enrollment`
Главная таблица сервиса. Хранит запись пользователя на курс и агрегированный прогресс.

Поля:
- `id uuid primary key`
- `user_id uuid not null references user_ref(id)`
- `course_id uuid not null references course_ref(id)`
- `status varchar(32) not null` (`enrolled`, `in_progress`, `completed`, `dropped`)
- `progress_percent numeric(5,2) not null default 0`
- `started_at timestamptz`
- `completed_at timestamptz`
- `last_activity_at timestamptz`
- `certificate_id uuid`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Ограничения:
- `unique (user_id, course_id)`

### `module_progress`
Прогресс пользователя по модулю.

Поля:
- `id uuid primary key`
- `enrollment_id uuid not null references enrollment(id) on delete cascade`
- `module_id uuid not null references module_ref(id)`
- `status varchar(32) not null` (`not_started`, `in_progress`, `completed`)
- `completed_lessons integer not null default 0`
- `progress_percent numeric(5,2) not null default 0`
- `started_at timestamptz`
- `completed_at timestamptz`
- `updated_at timestamptz not null default now()`

Ограничения:
- `unique (enrollment_id, module_id)`

### `lesson_progress`
Прогресс пользователя по конкретному уроку.

Поля:
- `id uuid primary key`
- `enrollment_id uuid not null references enrollment(id) on delete cascade`
- `lesson_id uuid not null references lesson_ref(id)`
- `status varchar(32) not null` (`not_started`, `in_progress`, `completed`)
- `attempts_count integer not null default 0`
- `score numeric(5,2)`
- `last_position_sec integer`
- `started_at timestamptz`
- `completed_at timestamptz`
- `updated_at timestamptz not null default now()`

Ограничения:
- `unique (enrollment_id, lesson_id)`

### `lesson_attempt`
Попытки прохождения урока. Нужна в основном для `quiz` и `coding` уроков.

Поля:
- `id uuid primary key`
- `lesson_progress_id uuid not null references lesson_progress(id) on delete cascade`
- `attempt_no integer not null`
- `status varchar(32) not null` (`started`, `submitted`, `checked`)
- `score numeric(5,2)`
- `started_at timestamptz not null default now()`
- `finished_at timestamptz`

Ограничения:
- `unique (lesson_progress_id, attempt_no)`

### `certificate`
Сертификат по завершённому курсу.

Поля:
- `id uuid primary key`
- `enrollment_id uuid not null unique references enrollment(id)`
- `user_id uuid not null`
- `course_id uuid not null`
- `issued_at timestamptz not null default now()`
- `file_url varchar(1024)`
- `serial_no varchar(128) unique`

## Основные связи
- `user_ref` 1 -> N `enrollment`
- `course_ref` 1 -> N `enrollment`
- `course_ref` 1 -> N `module_ref`
- `course_ref` 1 -> N `lesson_ref`
- `module_ref` 1 -> N `lesson_ref`
- `enrollment` 1 -> N `module_progress`
- `enrollment` 1 -> N `lesson_progress`
- `lesson_progress` 1 -> N `lesson_attempt`
- `enrollment` 1 -> 1 `certificate`

## Рекомендуемые индексы
```sql
create index idx_enrollment_user_id on enrollment(user_id);
create index idx_enrollment_course_id on enrollment(course_id);
create index idx_enrollment_status on enrollment(status);
create index idx_module_progress_enrollment_id on module_progress(enrollment_id);
create index idx_lesson_progress_enrollment_id on lesson_progress(enrollment_id);
create index idx_lesson_progress_lesson_id on lesson_progress(lesson_id);
create index idx_lesson_attempt_lesson_progress_id on lesson_attempt(lesson_progress_id);
```

## Процесс работы сервиса
1. `user-service` публикует события по пользователям, `learning-service` обновляет `user_ref`
2. `course-service` публикует события по курсам, модулям и урокам, `learning-service` обновляет `course_ref`, `module_ref`, `lesson_ref`
3. Пользователь записывается на курс, создаётся `enrollment`
4. Во время прохождения обновляются `module_progress` и `lesson_progress`
5. При необходимости создаются записи в `lesson_attempt`
6. После завершения курса создаётся `certificate`

## Границы ответственности сервиса
`learning-service` отвечает за:
- запись пользователя на курс
- прогресс по курсу
- прогресс по модулям
- прогресс по урокам
- завершение курса
- сертификаты

`user-service` отвечает за:
- пользователя как сущность
- профиль пользователя
- email, статус, фото и другие пользовательские данные

`course-service` отвечает за:
- курс как сущность
- структуру курса
- модули
- уроки
- контент уроков
