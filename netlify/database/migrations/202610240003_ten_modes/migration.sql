-- Extend existing installations without changing the original migrations or room IDs.
ALTER TABLE rooms DROP CONSTRAINT rooms_quiz_version_check;
ALTER TABLE rooms ADD CONSTRAINT rooms_quiz_version_check
  CHECK (quiz_version BETWEEN 0 AND 9);
