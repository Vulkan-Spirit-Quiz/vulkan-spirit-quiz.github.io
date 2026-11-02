-- Final question of each ten-question mission awards up to 2,500 points.
-- Existing constraint (0..1000) incorrectly rejected most correct final answers.
ALTER TABLE answers DROP CONSTRAINT IF EXISTS answers_points_check;
ALTER TABLE answers ADD CONSTRAINT answers_points_check CHECK(points BETWEEN 0 AND 2500);
