import type Database from 'better-sqlite3'
import type { FactRow, RequestStatus, SigningRequest, VerdictRoute } from '../decode/types.js'
import { openDatabase } from './index.js'

export type Db = Database.Database

function fromRow(row: Record<string, unknown>): SigningRequest {
  const verdict = typeof row.verdict === 'string' ? JSON.parse(row.verdict) : undefined
  const receipt = typeof row.receipt === 'string' ? JSON.parse(row.receipt) : undefined
  return {
    id: String(row.id),
    source: row.source as SigningRequest['source'],
    network: String(row.network),
    plainLine: String(row.plain_line),
    facts: JSON.parse(String(row.facts)) as FactRow[],
    risk: JSON.parse(String(row.risk)),
    raw: JSON.parse(String(row.raw)),
    status: row.status as RequestStatus,
    createdAt: Number(row.created_at),
    autoDenyAt: Number(row.auto_deny_at),
    verdict,
    telegramChatId: row.telegram_chat_id == null ? undefined : Number(row.telegram_chat_id),
    telegramMessageId: row.telegram_message_id == null ? undefined : Number(row.telegram_message_id),
    receipt,
  }
}

export function createLedger(filename: string) {
  const db: Db = openDatabase(filename)

  function insert(request: SigningRequest): void {
    db.prepare(`INSERT INTO requests
      (id, source, network, plain_line, facts, risk, raw, status, created_at, auto_deny_at, telegram_chat_id, telegram_message_id)
      VALUES (@id, @source, @network, @plainLine, @facts, @risk, @raw, @status, @createdAt, @autoDenyAt, @telegramChatId, @telegramMessageId)`)
      .run({
        id: request.id,
        source: request.source,
        network: request.network,
        plainLine: request.plainLine,
        facts: JSON.stringify(request.facts),
        risk: JSON.stringify(request.risk),
        raw: JSON.stringify(request.raw),
        status: request.status,
        createdAt: request.createdAt,
        autoDenyAt: request.autoDenyAt,
        telegramChatId: request.telegramChatId ?? null,
        telegramMessageId: request.telegramMessageId ?? null,
      })
  }

  function get(id: string): SigningRequest | undefined {
    const row = db.prepare('SELECT * FROM requests WHERE id = ?').get(id) as Record<string, unknown> | undefined
    return row ? fromRow(row) : undefined
  }

  function list(filter?: string): SigningRequest[] {
    const rows = (filter && filter !== 'ALL'
      ? db.prepare('SELECT * FROM requests ORDER BY created_at DESC LIMIT 500').all().filter((r) => {
          const item = fromRow(r as Record<string, unknown>)
          if (filter === 'APPROVED' || filter === 'DENIED') return item.status === filter.toLowerCase()
          if (filter === 'RISK') return item.risk.level !== 'safe'
          return true
        })
      : db.prepare('SELECT * FROM requests ORDER BY created_at DESC LIMIT 500').all()) as Record<string, unknown>[]
    return rows.map(fromRow)
  }

  function pending(): SigningRequest | undefined {
    const row = db.prepare("SELECT * FROM requests WHERE status = 'pending' ORDER BY created_at ASC LIMIT 1").get() as Record<string, unknown> | undefined
    return row ? fromRow(row) : undefined
  }

  function pendingIds(): string[] {
    const rows = db.prepare("SELECT id FROM requests WHERE status = 'pending'").all() as Array<{ id: string }>
    return rows.map((r) => r.id)
  }

  function recordVerdict(id: string, status: RequestStatus, route: VerdictRoute): SigningRequest | undefined {
    const current = get(id)
    if (!current) return undefined
    const verdict = { route, at: Date.now() }
    db.prepare('UPDATE requests SET status = ?, verdict = ? WHERE id = ?').run(status, JSON.stringify(verdict), id)
    return get(id)
  }

  function recordReceipt(id: string, receipt: Record<string, unknown>): void {
    db.prepare('UPDATE requests SET receipt = ? WHERE id = ?').run(JSON.stringify(receipt), id)
  }

  function counts(): Record<string, number> {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const rows = db.prepare('SELECT status, COUNT(*) AS n FROM requests WHERE created_at >= ? GROUP BY status').all(start.getTime()) as Array<{ status: string; n: number }>
    const out: Record<string, number> = { waiting: 0, approved: 0, denied: 0, expired: 0 }
    for (const row of rows) out[row.status] = Number(row.n)
    return out
  }

  function createPairing(code: string, expiresAt: number): void {
    db.prepare('INSERT INTO pairings (code, expires_at) VALUES (?, ?)').run(code, expiresAt)
  }

  function confirmPairing(code: string, deviceId: string): boolean {
    const row = db.prepare('SELECT expires_at FROM pairings WHERE code = ?').get(code) as { expires_at: number } | undefined
    if (!row || row.expires_at < Date.now()) return false
    db.prepare('UPDATE pairings SET bound_device_id = ? WHERE code = ?').run(deviceId, code)
    return true
  }

  return { db, insert, get, list, pending, pendingIds, recordVerdict, recordReceipt, counts, createPairing, confirmPairing }
}

export type Ledger = ReturnType<typeof createLedger>
