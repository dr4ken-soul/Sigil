import { expect, test } from '@playwright/test'

/** Companion flows from FRONTEND_SPEC.md §3 and §4. */
test('companion shell shows the wordmark and three nav links', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'SIGIL' })).toBeVisible()
  for (const label of ['PAIR', 'LEDGER', 'SETTINGS']) {
    await expect(page.getByRole('link', { name: label })).toBeVisible()
  }
})

test('ledger shows the invariant', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'LEDGER' })).toBeVisible()
  await expect(page.getByText('! Ledger unavailable, retry')).toHaveCount(0)
})

test('pair page shows the six-character code and the regenerate action', async ({ page }) => {
  await page.goto('/pair')
  await expect(page.getByText('DEVICE PAIRING')).toBeVisible()
  await expect(page.getByText('Enter the code on your glasses')).toBeVisible()
  await expect(page.getByRole('button', { name: 'REGENERATE CODE' })).toBeVisible()
})

test('settings shows the no-auto-approve invariant', async ({ page }) => {
  await page.goto('/settings')
  await expect(page.getByText('Sigil never auto-approves. Timeouts can only deny.')).toBeVisible()
  await expect(page.getByRole('button', { name: '30s' })).toBeVisible()
})
