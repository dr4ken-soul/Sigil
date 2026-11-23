import { expect, test } from '@playwright/test'

/** Visual review at the breakpoints in FRONTEND_SPEC.md §6 and 576 × 288 on glass. */
test('companion desktop and mobile review', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'LEDGER' })).toBeVisible()
  await page.screenshot({ path: 'screenshots/companion-desktop.png', fullPage: true })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.reload()
  await expect(page.getByRole('heading', { name: 'LEDGER' })).toBeVisible()
  await page.screenshot({ path: 'screenshots/companion-mobile.png', fullPage: true })

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/settings')
  await expect(page.getByText('Sigil never auto-approves. Timeouts can only deny.')).toBeVisible()
  await page.screenshot({ path: 'screenshots/companion-settings.png', fullPage: true })
})

test('g2 canvas at 576 by 288', async ({ page }) => {
  const url = process.env.G2_URL ?? 'http://localhost:5173'
  await page.setViewportSize({ width: 600, height: 320 })
  await page.goto(url)
  await expect(page.getByText('NO REQUESTS WAITING')).toBeVisible()
  await page.screenshot({ path: 'screenshots/g2-idle.png' })
})
