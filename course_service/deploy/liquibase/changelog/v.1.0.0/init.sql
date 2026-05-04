--liquibase formatted sql

--changeset morrs:course-service-init

CREATE TABLE course
(
    id                UUID PRIMARY KEY,
    author_id         UUID         NOT NULL,
    title             VARCHAR(255) NOT NULL,
    short_description VARCHAR(500),
    description       TEXT,
    difficulty        VARCHAR(32),
    language_code     VARCHAR(16),
    estimated_minutes INTEGER      NOT NULL DEFAULT 0,
    structure         JSONB        NOT NULL DEFAULT '{"modules": []}'::jsonb,
    is_preview        BOOLEAN      DEFAULT FALSE,
    fts_vector        tsvector     GENERATED ALWAYS AS(to_tsvector('simple'::regconfig, coalesce(title, ''))) STORED,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_course_difficulty
        CHECK (difficulty IS NULL OR difficulty IN ('beginner', 'intermediate', 'advanced')),
    CONSTRAINT chk_course_estimated_minutes
        CHECK (estimated_minutes >= 0)
);
CREATE INDEX idx_course_fts_vector ON course USING GIN (fts_vector);

CREATE TABLE lesson_content
(
    lesson_id   UUID PRIMARY KEY,
    course_id   UUID         NOT NULL,
    lesson_type VARCHAR(32)  NOT NULL,
    title       VARCHAR(255) NOT NULL,
    content     JSONB        NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_lesson_content_course
        FOREIGN KEY (course_id) REFERENCES course (id) ON DELETE CASCADE,
    CONSTRAINT chk_lesson_content_type
        CHECK (lesson_type IN ('theory', 'quiz', 'coding'))
);

CREATE TABLE asset
(
    id                UUID PRIMARY KEY,
    course_id         UUID          NOT NULL,
    lesson_id         UUID,
    asset_type        VARCHAR(32)   NOT NULL,
    storage_key       VARCHAR(1024) NOT NULL,
    public_url        VARCHAR(1024),
    mime_type         VARCHAR(255),
    size_bytes        BIGINT,
    original_filename VARCHAR(255),
    title             VARCHAR(255),
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_asset_course
        FOREIGN KEY (course_id) REFERENCES course (id) ON DELETE CASCADE,
    CONSTRAINT chk_asset_type
        CHECK (asset_type IN ('image', 'video', 'file', 'cover')),
    CONSTRAINT chk_asset_size_bytes
        CHECK (size_bytes IS NULL OR size_bytes >= 0)
);

-- CREATE TABLE lesson_index
-- (
--     lesson_id        UUID PRIMARY KEY,
--     course_id        UUID         NOT NULL,
--     module_id        UUID         NOT NULL,
--     module_position  INTEGER      NOT NULL,
--     lesson_position  INTEGER      NOT NULL,
--     lesson_type      VARCHAR(32)  NOT NULL,
--     title            VARCHAR(255) NOT NULL,
--     is_preview       BOOLEAN      NOT NULL DEFAULT FALSE,
--     CONSTRAINT fk_lesson_index_course
--         FOREIGN KEY (course_id) REFERENCES course (id) ON DELETE CASCADE,
--     CONSTRAINT chk_lesson_index_type
--         CHECK (lesson_type IN ('theory', 'quiz', 'coding')),
--     CONSTRAINT chk_lesson_index_module_position
--         CHECK (module_position > 0),
--     CONSTRAINT chk_lesson_index_lesson_position
--         CHECK (lesson_position > 0)
-- );

CREATE TABLE tag
(
    id   UUID PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE
);

CREATE TABLE course_tag
(
    course_id UUID NOT NULL,
    tag_id    UUID NOT NULL,
    PRIMARY KEY (course_id, tag_id),
    CONSTRAINT fk_course_tag_course
        FOREIGN KEY (course_id) REFERENCES course (id) ON DELETE CASCADE,
    CONSTRAINT fk_course_tag_tag
        FOREIGN KEY (tag_id) REFERENCES tag (id) ON DELETE CASCADE
);


CREATE INDEX idx_course_author_id
    ON course (author_id);

CREATE INDEX idx_course_difficulty
    ON course (difficulty);

CREATE INDEX idx_lesson_content_course_id
    ON lesson_content (course_id);

CREATE INDEX idx_asset_course_id
    ON asset (course_id);

CREATE INDEX idx_asset_lesson_id
    ON asset (lesson_id);

-- CREATE INDEX idx_lesson_index_course_id
--     ON lesson_index (course_id);
--
-- CREATE INDEX idx_lesson_index_module_id
--     ON lesson_index (module_id);
