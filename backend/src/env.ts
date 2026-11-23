import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/** Minimal .env loader. Values already in the process environment win. */
export function loadEnv(root: string): Record<string, string> {
  const out: Record<string, string> = {}
  try {
    const text = readFileSync(resolve(root, '.env'), 'utf8')
    for (const line of text.split('\n')) {
      const clean = line.trim()
      if (!clean || clean.startsWith('#')) continue
      const at = clean.indexOf('=')
      if (at < 0) continue
      const key = clean.slice(0, at).trim()
      const value = clean.slice(at + 1).trim().replace(/^["']|["']$/g, '')
      out[key] = value.startsWith('#') ? '' : value
    }
  } catch {
    // A missing .env is allowed. Missing credentials are reported explicitly.
  }
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined) out[key] = value
  }
  return out
}
