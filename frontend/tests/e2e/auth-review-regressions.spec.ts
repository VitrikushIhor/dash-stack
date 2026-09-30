import { expect, test } from '@playwright/test'

const backendUrl = process.env.E2E_BACKEND_URL ?? 'http://127.0.0.1:8000/api'
const reviewAccount = 'review-e2e@dashstack.app'

async function signIn(page: import('@playwright/test').Page, email: string) {
  await page.goto('/sign-in')
  await page.getByLabel('Email', { exact: true }).fill(email)
  await page.getByLabel('Password', { exact: true }).fill('secret42')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL(/\/vocab\/decks$/, { timeout: 15_000 })
}

test('should_allow_sign_in_after_another_device_revokes_an_unexpired_session', async ({
  page,
  context,
  playwright,
}) => {
  await signIn(page, reviewAccount)
  const oldAccess = (await context.cookies()).find(
    (cookie) => cookie.name === 'access_token'
  )
  if (!oldAccess) throw new Error('Sign-in did not establish an access cookie')
  await page.goto('about:blank')
  const deviceB = await playwright.request.newContext({
    extraHTTPHeaders: {
      origin: process.env.E2E_FRONTEND_URL ?? 'http://localhost:3000',
    },
  })
  try {
    const login = await deviceB.post(`${backendUrl}/auth/login`, {
      data: { email: reviewAccount, password: 'secret42' },
    })
    expect(login.status()).toBe(200)
    const revoke = await deviceB.post(`${backendUrl}/auth/logout-all`)
    expect(revoke.status()).toBe(200)
    const revokedIdentity = await deviceB.get(`${backendUrl}/me`, {
      headers: { authorization: `Bearer ${oldAccess.value}` },
    })
    expect(revokedIdentity.status()).toBe(401)
  } finally {
    await deviceB.dispose()
  }
  await page.goto('/user/settings')
  await expect(page.getByText('Unauthorized Access')).toBeVisible()
  expect(
    (await context.cookies()).find((cookie) => cookie.name === 'access_token')
      ?.value
  ).toBe(oldAccess.value)
  await page.getByRole('link', { name: 'Sign In', exact: true }).click()
  await expect(page.getByLabel('Email', { exact: true })).toBeVisible()
  await page.getByLabel('Email', { exact: true }).fill(reviewAccount)
  await page.getByLabel('Password', { exact: true }).fill('secret42')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL(/\/vocab\/decks$/, { timeout: 15_000 })
  await page.goto('/user/settings')
  await expect(page.getByLabel('Email Address')).toHaveValue(
    reviewAccount
  )
})

test('should_complete_sign_in_and_logout_when_auth_notification_storage_is_blocked', async ({
  page,
  context,
}) => {
  await context.addInitScript(() => {
    const originalGet = Storage.prototype.getItem
    const originalSet = Storage.prototype.setItem
    Storage.prototype.getItem = function (key: string) {
      if (key === 'dash-stack:auth-session-event')
        throw new DOMException('Blocked', 'SecurityError')
      return originalGet.call(this, key)
    }
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key === 'dash-stack:auth-session-event')
        throw new DOMException('Full', 'QuotaExceededError')
      originalSet.call(this, key, value)
    }
  })
  const uncaught: string[] = []
  page.on('pageerror', (error) => uncaught.push(error.message))
  await signIn(page, reviewAccount)
  await page.getByRole('button', { name: /user menu:/i }).click()
  await page.getByRole('menuitem', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/sign-in$/)
  expect(
    (await context.cookies()).filter((cookie) =>
      ['access_token', 'refresh_token'].includes(cookie.name)
    )
  ).toHaveLength(0)
  expect(uncaught).toEqual([])
})
