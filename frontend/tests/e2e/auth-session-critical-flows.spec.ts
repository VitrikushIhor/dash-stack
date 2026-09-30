import { expect, test } from '@playwright/test'

const accounts = {
  admin: { email: 'admin@dashstack.app', password: 'secret42' },
  bart: { email: 'bart@simpson.com', password: 'secret42' },
} as const

async function signIn(
  page: import('@playwright/test').Page,
  account: { email: string; password: string }
) {
  await page.goto('/sign-in')
  await page.getByLabel('Email', { exact: true }).fill(account.email)
  await page.getByLabel('Password', { exact: true }).fill(account.password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL(/\/vocab\/decks$/, { timeout: 15_000 })
}

test.describe('Auth session browser lifecycle', () => {
  test('should_recover_protected_navigation_when_access_cookie_is_missing', async ({
    page,
    context,
  }) => {
    await signIn(page, accounts.bart)
    const cookies = await context.cookies()
    const refresh = cookies.find((cookie) => cookie.name === 'refresh_token')
    expect(refresh).toBeDefined()
    await context.clearCookies()
    if (!refresh) throw new Error('Refresh cookie is required for this scenario')
    await context.addCookies([refresh])

    const response = await page.goto('/user/settings')

    expect(response?.status()).toBe(200)
    await expect(page.getByLabel('Email Address')).toHaveValue(accounts.bart.email)
    const recovered = await context.cookies()
    expect(recovered.find((cookie) => cookie.name === 'access_token')?.value).toBeTruthy()
    expect(recovered.find((cookie) => cookie.name === 'refresh_token')?.value).toBe(refresh.value)
  })

  test('should_keep_one_session_after_ten_parallel_recoveries', async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('Playwright baseURL is required')
    await signIn(page, accounts.bart)
    const refreshBefore = (await context.cookies()).find((cookie) => cookie.name === 'refresh_token')
    expect(refreshBefore).toBeDefined()
    await context.addCookies([{
      name: 'access_token',
      value: 'invalid-access-token',
      url: new URL(page.url()).origin,
      httpOnly: true,
      sameSite: 'Lax',
    }])

    const responses = await Promise.all(
      Array.from({ length: 10 }, () => context.request.get(`${baseURL}/api/proxy/me`))
    )

    expect(responses.map((response) => response.status())).toEqual(Array(10).fill(200))
    const cookiesAfter = await context.cookies()
    expect(cookiesAfter.find((cookie) => cookie.name === 'refresh_token')?.value).toBe(refreshBefore?.value)
    expect(cookiesAfter.find((cookie) => cookie.name === 'access_token')?.value).not.toBe('invalid-access-token')
    await page.goto('/user/settings')
    await expect(page.getByLabel('Email Address')).toHaveValue(accounts.bart.email)
  })

  test('should_allow_sign_in_when_existing_session_cookies_are_invalid', async ({ page, context }) => {
    await page.goto('/sign-in')
    const origin = new URL(page.url()).origin
    await context.addCookies(['access_token', 'refresh_token'].map((name) => ({
      name,
      value: 'invalid-credential',
      url: origin,
      httpOnly: true,
      sameSite: 'Lax' as const,
    })))

    await page.goto('/sign-in')
    await expect(page.getByLabel('Email', { exact: true })).toBeVisible()
    await signIn(page, accounts.bart)
    await expect(page).toHaveURL(/\/vocab\/decks$/)
  })

  test('should_return_to_sign_in_when_both_session_cookies_are_invalid', async ({ page, context }) => {
    await page.goto('/sign-in')
    const origin = new URL(page.url()).origin
    await context.addCookies(['access_token', 'refresh_token'].map((name) => ({
      name,
      value: 'invalid-credential',
      url: origin,
      httpOnly: true,
      sameSite: 'Lax' as const,
    })))

    await page.goto('/user/settings')

    await expect(page).toHaveURL(/\/sign-in\?redirect=%2Fuser%2Fsettings$/)
    await expect(page.getByLabel('Email', { exact: true })).toBeVisible()
    await expect(page.getByLabel('Email Address')).toHaveCount(0)
  })

  test('recovers a protected direct navigation when access cookie is invalid', async ({
    page,
    context,
  }) => {
    await signIn(page, accounts.admin)
    await context.addCookies([
      {
        name: 'access_token',
        value: 'invalid-access-token',
        url: new URL(page.url()).origin,
        httpOnly: true,
        sameSite: 'Lax',
      },
    ])

    const response = await page.goto('/user/settings')

    expect(response?.status()).toBe(200)
    await expect(page).toHaveURL(/\/user\/settings$/)
    await expect(page.getByLabel('Email Address')).toHaveValue(accounts.admin.email)
    const cookies = await context.cookies()
    expect(cookies.find((cookie) => cookie.name === 'access_token')?.value).not.toBe(
      'invalid-access-token'
    )
  })

  test('clears another tab after logout and switches it to the next account', async ({
    page,
    context,
  }) => {
    await signIn(page, accounts.admin)
    const oldAccess = (await context.cookies()).find((cookie) => cookie.name === 'access_token')
    expect(oldAccess).toBeDefined()
    const otherTab = await context.newPage()
    await otherTab.goto('/user/settings')
    await expect(otherTab.getByLabel('Email Address')).toHaveValue(accounts.admin.email)

    await page.getByRole('button', { name: /user menu:/i }).click()
    await page.getByRole('menuitem', { name: 'Sign out' }).click()
    await expect(page).toHaveURL(/\/sign-in$/)
    await expect(otherTab).toHaveURL(/\/sign-in$/)
    await expect(otherTab.getByLabel('Email Address')).toHaveCount(0)

    if (!oldAccess) throw new Error('Access cookie is required for revocation check')
    await context.addCookies([oldAccess])
    const revokedAccess = await context.request.get('/api/proxy/me')
    expect(revokedAccess.status()).toBe(401)
    await context.clearCookies()

    await signIn(page, accounts.bart)
    await expect(otherTab).toHaveURL(/\/vocab\/decks$/)
    await otherTab.goto('/user/settings')
    await expect(otherTab.getByLabel('Email Address')).toHaveValue(accounts.bart.email)
  })
  test('should_refresh_other_tab_identity_after_oauth_completion_signal', async ({ page, context }) => {
    await signIn(page, accounts.bart)
    const otherTab = await context.newPage()
    await otherTab.goto('/user/settings')
    await expect(otherTab.getByLabel('Email Address')).toHaveValue(accounts.bart.email)

    // Issue the replacement session locally; live Auth0 is outside this bridge regression.
    const backendUrl = process.env.E2E_BACKEND_URL ?? 'http://127.0.0.1:8000/api'
    const login = await context.request.post(`${backendUrl}/auth/login`, {
      data: { email: 'review-e2e@dashstack.app', password: 'secret42' },
      headers: { origin: process.env.E2E_FRONTEND_URL ?? 'http://localhost:3000' },
    })
    expect(login.ok()).toBeTruthy()
    await page.goto('/vocab/decks?auth-session=changed')
    await expect(page).toHaveURL(/\/vocab\/decks$/)
    await expect(otherTab).toHaveURL(/\/vocab\/decks$/)
    await otherTab.goto('/user/settings')
    await expect(otherTab.getByLabel('Email Address')).toHaveValue(
      'review-e2e@dashstack.app'
    )
  })

  test('should_clear_local_session_and_other_tab_when_server_revoke_rejects_credential', async ({ page, context }) => {
    const account = {
      email: 'sessions-e2e@dashstack.app',
      password: 'secret42',
    }
    await signIn(page, account)
    const otherTab = await context.newPage()
    await otherTab.goto('/user/settings')
    await expect(otherTab.getByLabel('Email Address')).toHaveValue(account.email)
    await context.addCookies([{
      name: 'refresh_token', value: 'invalid-session-credential',
      url: new URL(page.url()).origin, httpOnly: true, sameSite: 'Lax',
    }])

    await page.getByRole('button', { name: /user menu:/i }).click()
    await page.getByRole('menuitem', { name: 'Sign out' }).click()
    await expect(page).toHaveURL(/\/sign-in$/)
    await expect(otherTab).toHaveURL(/\/sign-in$/)
    const cookies = await context.cookies()
    expect(cookies.filter((cookie) => ['access_token', 'refresh_token'].includes(cookie.name))).toHaveLength(0)
    await expect(otherTab.getByLabel('Email Address')).toHaveCount(0)
  })

})
