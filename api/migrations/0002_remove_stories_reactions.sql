-- Story va reaksiya (like) loyiha chegarasidan chiqarildi (SCOPE.md).
DROP TABLE IF EXISTS stories;
ALTER TABLE posts DROP COLUMN IF EXISTS reactions;
