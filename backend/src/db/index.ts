import Database from 'better-sqlite3'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const schema = readFileSync(resolve(here, 'schema.sql'), 'utf8')

/** One SQLite database on the operator's own server. No user content leaves it. */
export function openDatabase(filename: string): Database.Database {
  const db = new Database(filename)
  db.pragma('journal_mode = WAL')
  db.exec(schema)
  return db
}
