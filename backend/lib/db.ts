import Database, { type Database as DatabaseType } from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const loadDb = (
  filename: string,
  onCreate?: (db: DatabaseType) => void
) => {
  const dbDir = path.resolve(__dirname, "../storage/db");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.resolve(dbDir, filename + ".db");
  const isDbExist = fs.existsSync(dbPath);

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  if (!isDbExist && onCreate) {
    onCreate(db);
  }

  return db;
};
