-- Add the final five-question challenge without changing existing mission IDs.
ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_quiz_version_check;
ALTER TABLE rooms ADD CONSTRAINT rooms_quiz_version_check CHECK (quiz_version BETWEEN 0 AND 10);
