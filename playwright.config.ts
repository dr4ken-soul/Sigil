import { defineConfig, devices } from '@playwright/test'

/** Playwright against the companion. Backend base is set through env. */
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: {
    baseURL: process.env.COMPANION_URL ?? 'http://localhost:3000',
    ...devices['Desktop Chrome'],
  },
  webServer: process.env.COMPANION_URL ? undefined : {
    command: 'npm --prefix companion run start',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
