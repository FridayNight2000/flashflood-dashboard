import Database from 'better-sqlite3';
import path from 'path';

// Build an absolute path to the shared DB file at the repo root.
const dbPath = path.join(process.cwd(), '..', 'hydrology_data.db');
// In Next.js dev, process.cwd() is usually web/, so use .. to reach the repo root.

export const db = new Database(dbPath, {
  readonly: true,
  fileMustExist: true,
});
