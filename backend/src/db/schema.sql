CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  network TEXT NOT NULL,
  plain_line TEXT NOT NULL,
  facts TEXT NOT NULL,
  risk TEXT NOT NULL,
  raw TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  auto_deny_at INTEGER NOT NULL,
  verdict TEXT,
  telegram_chat_id INTEGER,
  telegram_message_id INTEGER,
  receipt TEXT
);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS pairings (
  code TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL,
  bound_device_id TEXT
);
