-- The Kobayashi Maru music question allows 45 seconds to answer.
ALTER TABLE answers DROP CONSTRAINT IF EXISTS answers_elapsed_check;
ALTER TABLE answers ADD CONSTRAINT answers_elapsed_check CHECK (elapsed >= 0 AND elapsed < 60000);
