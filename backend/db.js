const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'chattotask.db');
const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  raw_text TEXT NOT NULL,
  summary TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER,
  description TEXT,
  assignee TEXT,
  deadline TEXT,
  status TEXT DEFAULT 'open',
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);
CREATE TABLE IF NOT EXISTS decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER,
  description TEXT,
  type TEXT, -- 'decision' or 'approval'
  status TEXT DEFAULT 'pending',
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);
`);

module.exports = db;
