ALTER TABLE rooms ADD COLUMN quiz_version INTEGER CHECK (quiz_version BETWEEN 0 AND 4);
ALTER TABLE rooms ADD COLUMN prize TEXT NOT NULL DEFAULT 'Goldenes Sternenflotten-Diplom';
ALTER TABLE teams ADD COLUMN avatar TEXT NOT NULL DEFAULT 'spock';
