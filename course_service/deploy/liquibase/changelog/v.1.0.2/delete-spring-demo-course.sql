--liquibase formatted sql

--changeset codex:delete-spring-demo-course

DELETE FROM course
WHERE id = '51652887-b537-468f-91e0-bc4ee1ddb4fd'
   OR author_id = '4ddf2ae0-3da9-46c0-a088-a28726f2aff6';
