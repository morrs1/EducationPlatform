# Схема БД для course-service

## Назначение
`course-service` хранит:
- метаданные курса
- структуру курса: модули и уроки
- контент уроков
- вложения уроков: изображения, видео, файлы

Сервис **не** хранит прогресс пользователей.

## Таблицы

### `course`
Хранит метаданные курса и дерево модулей и уроков в `structure jsonb`.

Поля:
- `id uuid primary key`
- `author_id uuid not null`
- `slug varchar(255) not null unique`
- `title varchar(255) not null`
- `short_description varchar(500)`
- `description text`
- `status varchar(32) not null` (`draft`, `published`, `archived`)
- `difficulty varchar(32)` (`beginner`, `intermediate`, `advanced`)
- `language_code varchar(16)`
- `cover_asset_id uuid`
- `estimated_minutes integer not null default 0`
- `structure jsonb not null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Пример `structure`:
```json
{
  "modules": [
    {
      "id": "module-uuid",
      "title": "Модуль 1",
      "description": "Базовые темы",
      "position": 1,
      "estimatedMinutes": 120,
      "lessons": [
        {
          "id": "lesson-uuid",
          "type": "theory",
          "title": "Введение",
          "position": 1,
          "estimatedMinutes": 15,
          "isPreview": true
        }
      ]
    }
  ]
}
```

### `lesson_content`
Хранит содержимое конкретного урока.

Поля:
- `lesson_id uuid primary key`
- `course_id uuid not null references course(id) on delete cascade`
- `lesson_type varchar(32) not null` (`theory`, `quiz`, `coding`)
- `title varchar(255) not null`
- `content jsonb not null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Примеры:

Theory:
```json
{
  "markdown": "# Заголовок урока\nТекст..."
}
```

Quiz:
```json
{
  "introMarkdown": "## Вопросы",
  "questions": [
    {
      "id": "11111111-1111-1111-1111-111111111111",
      "type": "single_choice",
      "text": "Вопрос?",
      "options": [
        { "id": "22222222-2222-2222-2222-222222222221", "text": "A", "isCorrect": true },
        { "id": "22222222-2222-2222-2222-222222222222", "text": "B", "isCorrect": false }
      ]
    }
  ]
}
```

Coding:
```json
{
  "taskMarkdown": "## Задача\nРешите...",
  "checkerType": "stdin_stdout",
  "languages": [
    {
      "language": "java",
      "starterCode": "class Main {}"
    }
  ],
  "testCases": [
    {
      "id": "33333333-3333-3333-3333-333333333331",
      "public": true,
      "input": "1",
      "expectedOutput": "1"
    }
  ]
}
```

### `asset`
Хранит метаданные вложений урока. Сами файлы лежат в object storage.

Поля:
- `id uuid primary key`
- `course_id uuid not null references course(id) on delete cascade`
- `lesson_id uuid`
- `asset_type varchar(32) not null` (`image`, `video`, `file`, `cover`)
- `storage_key varchar(1024) not null`
- `public_url varchar(1024)`
- `mime_type varchar(255)`
- `size_bytes bigint`
- `original_filename varchar(255)`
- `title varchar(255)`
- `created_at timestamptz not null default now()`

### `lesson_index`
Плоский индекс уроков для быстрого поиска по `lesson_id` без разбора полного `course.structure`.

Поля:
- `lesson_id uuid primary key`
- `course_id uuid not null references course(id) on delete cascade`
- `module_id uuid not null`
- `module_position integer not null`
- `lesson_position integer not null`
- `lesson_type varchar(32) not null`
- `title varchar(255) not null`
- `is_preview boolean not null default false`

### `tag`
Поля:
- `id uuid primary key`
- `name varchar(64) not null unique`

### `course_tag`
Связующая таблица для тегов курса.

Поля:
- `course_id uuid not null references course(id) on delete cascade`
- `tag_id uuid not null references tag(id) on delete cascade`
- `primary key (course_id, tag_id)`

## Основные связи
- `course` 1 -> N `lesson_content`
- `course` 1 -> N `asset`
- `course` 1 -> N `lesson_index`
- `course` N -> N `tag` через `course_tag`

`lesson_id` и `module_id` генерируются приложением и хранятся внутри `course.structure`.

## Рекомендуемые индексы
```sql
create index idx_course_author_id on course(author_id);
create index idx_course_status on course(status);
create index idx_course_difficulty on course(difficulty);
create index idx_lesson_content_course_id on lesson_content(course_id);
create index idx_asset_course_id on asset(course_id);
create index idx_asset_lesson_id on asset(lesson_id);
create index idx_lesson_index_course_id on lesson_index(course_id);
create index idx_lesson_index_module_id on lesson_index(module_id);
```

## Процесс редактирования курса
1. Создать курс
2. Добавить модули в `course.structure`
3. Добавить уроки в `course.structure`
4. Создать или обновить `lesson_content` для каждого урока
5. Загрузить файлы в storage и сохранить их метаданные в `asset`
6. Пересобрать `lesson_index` после изменения структуры курса

## Границы ответственности сервиса
`course-service` отвечает за:
- метаданные курса
- структуру курса
- контент уроков
- вложения уроков

`learning-service` отвечает за:
- запись пользователя на курс
- прогресс
- завершение курса
- сертификаты
