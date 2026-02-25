-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table (quiz/test attempts)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('study', 'quiz', 'test')),
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  score REAL,
  total_questions INTEGER,
  correct_answers INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Individual question responses
CREATE TABLE IF NOT EXISTS responses (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  user_answer TEXT,
  correct_answer TEXT,
  is_correct BOOLEAN,
  time_spent_seconds INTEGER,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Create indices for common queries
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_mode ON sessions(mode);
CREATE INDEX IF NOT EXISTS idx_responses_session_id ON responses(session_id);
