import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(process.cwd(), 'src')
const files = [
  'app/page.tsx', 'app/pair/page.tsx', 'app/settings/page.tsx',
  'components/topBar.tsx', 'components/ledgerRow.tsx', 'components/pairCard.tsx',
]

describe('companion source rules', () => {
  it('uses no em dash in interface copy', () => {
    for (const file of files) {
      const source = readFileSync(join(root, file), 'utf8')
      expect(source.includes('—')).toBe(false)
    }
  })
  it('never reads a token from localStorage', () => {
    for (const file of files) {
      const source = readFileSync(join(root, file), 'utf8')
      expect(source.includes('localStorage')).toBe(false)
    }
  })
})
