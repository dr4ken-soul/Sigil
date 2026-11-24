import { expect, test, type Page } from '@playwright/test'

/** Full G2 state audit at 576 × 288 from FRONTEND_SPEC.md §2. */
const url = process.env.G2_URL ?? 'http://localhost:5173'

const card = {
  id: 'audit-card',
  plainLine: 'Let 0x1f4b…c2e8 move any amount of your USDT',
  source: 'evm',
  network: 'sepolia',
  risk: { level: 'danger', flags: [{ level: 'danger', fact: 'unlimited allowance' }] },
  facts: [
    { label: 'VALUE', value: 'any USDT', flagged: true },
    { label: 'TO', value: '0x1f4b1234567890abcdef1234567890abcdefc2e8' },
    { label: 'NETWORK', value: 'sepolia' },
  ],
  autoDenyAt: Date.now() + 600_000,
  status: 'pending',
}

async function start(page: Page) {
  await page.setViewportSize({ width: 600, height: 320 })
  await page.goto(url)
  await expect(page.getByText('NO REQUESTS WAITING')).toBeVisible()
  await page.evaluate((c) => (window as any).sigil.start(c), card)
}

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `screenshots/g2-${name}.png` })
}

test('all G2 screens render at 576 by 288', async ({ page }) => {
  await start(page)
  await shot(page, 'decoding')

  await expect(page.getByText(card.plainLine)).toBeVisible({ timeout: 3000 })
  await shot(page, 'verdict')

  await page.evaluate(() => (window as any).sigil.dispatch({ type: 'VOICE_START' }))
  await expect(page.getByText('LISTENING')).toBeVisible()
  await shot(page, 'voice')

  await page.evaluate(() => (window as any).sigil.dispatch({ type: 'VOICE', text: 'details' }))
  await expect(page.getByText('SIMULATION')).toBeVisible()
  await shot(page, 'detail')

  for (let i = 0; i < 4; i += 1) await page.evaluate(() => (window as any).sigil.dispatch({ type: 'RING_TAP' }))
  await page.evaluate(() => (window as any).sigil.dispatch({ type: 'RING_TAP' }))
  await expect(page.getByText('✓ APPROVED')).toBeVisible()
  await shot(page, 'stamp')

  await page.evaluate(() => (window as any).sigil.dispatch({ type: 'SUMMARY' }))
  await expect(page.getByText('SESSION CLEAR')).toBeVisible()
  await shot(page, 'summary')

  await page.evaluate(() => (window as any).sigil.dispatch({ type: 'DECODE_FAILED', stage: 'DECODE FAILED' }))
  await expect(page.getByText('COULD NOT READ THIS REQUEST')).toBeVisible()
  await shot(page, 'error')

  await page.evaluate(() => (window as any).sigil.dispatch({ type: 'OFFLINE' }))
  await expect(page.getByText('WAITING FOR LINK')).toBeVisible()
  await shot(page, 'offline')
})
