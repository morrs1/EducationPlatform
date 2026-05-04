--liquibase formatted sql

--changeset codex:fix-user-service-demo-authors-required-fields

UPDATE users
SET password = 'DemoPass123',
    profile_photo_link = ''
WHERE id IN ('ed0bda1c-5f0b-4677-9698-b522b3efacc4',
             '909262ef-d229-47aa-8fdd-8c3f93adfd5d');
