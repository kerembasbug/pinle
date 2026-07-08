import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { nearestDistrict } from "./districts";

const DATA_DIR = path.join(process.cwd(), "data");

let _db: Database.Database | null = null;

export function db(): Database.Database {
  if (_db) return _db;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  _db = new Database(path.join(DATA_DIR, "pinle.db"));
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  migrate(_db);
  return _db;
}

function migrate(d: Database.Database) {
  d.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      points INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pins (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      kind TEXT NOT NULL DEFAULT 'lezzet',
      category TEXT NOT NULL,
      district TEXT,
      price REAL,
      note TEXT,
      photo TEXT,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_pins_geo ON pins(lat, lng);
    CREATE INDEX IF NOT EXISTS idx_pins_created ON pins(created_at);

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      pin_id TEXT NOT NULL REFERENCES pins(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      body TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_comments_pin ON comments(pin_id);

    CREATE TABLE IF NOT EXISTS votes (
      pin_id TEXT NOT NULL REFERENCES pins(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      value INTEGER NOT NULL CHECK (value IN (1, -1)),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (pin_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS reports (
      pin_id TEXT NOT NULL REFERENCES pins(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (pin_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS points_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      points INTEGER NOT NULL,
      reason TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_events_user ON points_events(user_id, created_at);

    CREATE TABLE IF NOT EXISTS visits (
      day TEXT NOT NULL,
      user_id TEXT NOT NULL,
      PRIMARY KEY (day, user_id)
    );
  `);

  // Var olan veritabanları için: sonradan eklenen kolonlar
  const pinCols = d.prepare("PRAGMA table_info(pins)").all() as { name: string }[];
  if (!pinCols.some((c) => c.name === "kind")) {
    d.exec("ALTER TABLE pins ADD COLUMN kind TEXT NOT NULL DEFAULT 'lezzet'");
  }
  if (!pinCols.some((c) => c.name === "district")) {
    d.exec("ALTER TABLE pins ADD COLUMN district TEXT");
  }

  // İlçesi atanmamış pinleri doldur (seed dahil her açılışta idempotent)
  const missing = d
    .prepare("SELECT id, lat, lng FROM pins WHERE district IS NULL")
    .all() as { id: string; lat: number; lng: number }[];
  if (missing.length > 0) {
    const upd = d.prepare("UPDATE pins SET district = ? WHERE id = ?");
    const tx = d.transaction(() => {
      for (const p of missing) upd.run(nearestDistrict(p.lat, p.lng) ?? "-", p.id);
    });
    tx();
  }
}

/** Günlük tekil ziyaretçi kaydı — /api/me üzerinden çağrılır. */
export function recordVisit(userId: string) {
  db()
    .prepare("INSERT OR IGNORE INTO visits (day, user_id) VALUES (date('now'), ?)")
    .run(userId);
}

export function awardPoints(userId: string, points: number, reason: string) {
  const d = db();
  d.prepare("INSERT INTO points_events (user_id, points, reason) VALUES (?, ?, ?)").run(
    userId,
    points,
    reason
  );
  d.prepare("UPDATE users SET points = points + ? WHERE id = ?").run(points, userId);
}
