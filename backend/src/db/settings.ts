import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Db } from './ledger.js'
import type { RiskRules } from '../decode/types.js'

/** Settings persisted as JSON values. Secrets are never part of this table. */
export interface Settings {
  autoDenySeconds: 15 | 30 | 60
  checkAboveUsd: number
  maxLeverage: number
  trustedRecipients: string[]
  ringWakeWord: boolean
  sttLanguage: string
}

export const DEFAULT_SETTINGS: Settings = {
  autoDenySeconds: 30,
  checkAboveUsd: 1000,
  maxLeverage: 3,
  trustedRecipients: [],
  ringWakeWord: true,
  sttLanguage: 'en-GB',
}

function readDrainers(path: string): Set<string> {
  try {
    const data = JSON.parse(readFileSync(resolve(path), 'utf8')) as { addresses?: string[] }
    return new Set((data.addresses ?? []).map((a) => a.toLowerCase()))
  } catch {
    return new Set()
  }
}

/** Read merged settings from SQLite. */
export function getSettings(db: Db, drainerPath: string): Settings & { drainers: string[] } {
  const rows = db.prepare('SELECT key, value FROM settings').all() as Array<{ key: string; value: string }>
  const stored: Record<string, unknown> = {}
  for (const row of rows) {
    try { stored[row.key] = JSON.parse(row.value) } catch { stored[row.key] = row.value }
  }
  const settings = { ...DEFAULT_SETTINGS, ...stored } as Settings
  return { ...settings, drainers: [...readDrainers(drainerPath)] }
}

/** Persist only allowed setting keys. */
export function putSettings(db: Db, input: Partial<Settings>): Settings {
  const allowed: Array<keyof Settings> = ['autoDenySeconds', 'checkAboveUsd', 'maxLeverage', 'trustedRecipients', 'ringWakeWord', 'sttLanguage']
  const stmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
  const tx = db.transaction(() => {
    for (const key of allowed) {
      if (key in input) stmt.run(key, JSON.stringify(input[key]))
    }
  })
  tx()
  return { ...DEFAULT_SETTINGS, ...input }
}

/** Build the risk rules used by the scoring engine. */
export function getRules(db: Db, drainerPath: string): RiskRules {
  const settings = getSettings(db, drainerPath)
  return {
    checkAboveUsd: settings.checkAboveUsd,
    maxLeverage: settings.maxLeverage,
    trustedRecipients: new Set(settings.trustedRecipients.map((a) => a.toLowerCase())),
    drainers: new Set(settings.drainers.map((a) => a.toLowerCase())),
  }
}

/** Show only the last four characters of a configured key. */
export function lastFour(value: string | undefined): string {
  if (!value) return 'not configured'
  return `ending ${value.slice(-4)}`
}
