import { defineConfig, devices } from '@playwright/test'

const frontendUrl = process.env.E2E_FRONTEND_URL ?? 'http://127.0.0.1:3000'
const backendUrl = process.env.E2E_BACKEND_URL ?? 'http://127.0.0.1:8000/api'
const frontendPort = new URL(frontendUrl).port
const backendPort = new URL(backendUrl).port
const backendOrigin = new URL(backendUrl).origin

if (!frontendPort || !backendPort) {
  throw new Error('E2E frontend and backend URLs must include explicit ports')
}

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['line'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: frontendUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter backend start',
      cwd: '..',
      url: `${backendUrl.replace(/\/$/, '')}/health`,
      reuseExistingServer: false,
      env: { ...process.env, PORT: backendPort },
      timeout: 120_000,
    },
    {
      command: `pnpm --filter frontend exec next dev --turbo --port ${frontendPort}`,
      cwd: '..',
      url: frontendUrl,
      reuseExistingServer: false,
      env: {
        ...process.env,
        API_URL: backendOrigin,
        NEXT_PUBLIC_API_URL: backendOrigin,
      },
      timeout: 120_000,
    },
  ],
})
