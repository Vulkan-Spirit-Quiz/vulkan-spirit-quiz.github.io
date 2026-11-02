CREATE TABLE rooms (
  code TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  host_secret TEXT NOT NULL,
  phase TEXT NOT NULL DEFAULT 'lobby' CHECK (phase IN ('lobby','question','reveal','finished')),
  q INTEGER NOT NULL DEFAULT -1,
  started BIGINT NOT NULL DEFAULT 0,
  created BIGINT NOT NULL
);
CREATE INDEX rooms_owner_created ON rooms(owner,created);
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  room TEXT NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_key TEXT NOT NULL,
  secret TEXT NOT NULL,
  created BIGINT NOT NULL,
  UNIQUE(room,name_key)
);
CREATE INDEX teams_room ON teams(room);
CREATE TABLE answers (
  id TEXT PRIMARY KEY,
  room TEXT NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
  team TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  q INTEGER NOT NULL CHECK(q BETWEEN 0 AND 19),
  choice INTEGER NOT NULL CHECK(choice BETWEEN 0 AND 3),
  points INTEGER NOT NULL CHECK(points BETWEEN 0 AND 1000),
  elapsed INTEGER NOT NULL CHECK(elapsed>=0 AND elapsed<25000),
  UNIQUE(team,q)
);
CREATE INDEX answers_room_question ON answers(room,q);
