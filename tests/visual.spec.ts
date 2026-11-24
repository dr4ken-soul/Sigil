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

test('companion at 200 percent zoom and in greyscale', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'LEDGER' })).toBeVisible()
  await page.evaluate(() => { document.documentElement.style.zoom = '2' })
  await page.screenshot({ path: 'screenshots/companion-zoom200.png', fullPage: true })
  await page.evaluate(() => { document.documentElement.style.zoom = '1' })

  await page.request.post('http://localhost:8080/requests', {
    data: {
      source: 'evm',
      payload: { kind: 'evm-approve', to: '0x7a3c1234567890abcdef1234567890abcdef9f2c', spender: '0x1f4b1234567890abcdef1234567890abcdefc2e8', asset: 'USDT', unlimited: true },
    },
  })
  await page.reload()
  const row = page.locator('button[data-ledger-row="0"]')
  await expect(row).toBeVisible()
  await row.click()
  await expect(page.getByText('! unlimited allowance')).toBeVisible()
  await page.evaluate(() => { document.documentElement.style.filter = 'grayscale(1)' })
  await page.screenshot({ path: 'screenshots/companion-greyscale.png', fullPage: true })
})
