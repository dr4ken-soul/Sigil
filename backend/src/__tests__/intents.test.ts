import { describe, expect, it } from 'vitest'
import { matchIntent } from '../intents.js'

describe('voice intents', () => {
  it('matches the ordered intents', () => {
    expect(matchIntent('Approve.')).toBe('approve')
    expect(matchIntent('DENY')).toBe('deny')
    expect(matchIntent('details')).toBe('details')
    expect(matchIntent('explain')).toBe('explain')
  })
  it('never guesses', () => {
    expect(matchIntent('maybe send it')).toBeNull()
    expect(matchIntent('')).toBeNull()
  })
})
