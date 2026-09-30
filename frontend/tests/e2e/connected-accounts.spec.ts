import { expect, test } from '@playwright/test'

test('should_open_connected_accounts_and_start_session_bound_provider_confirmation', async ({ page, context }) => {
  await page.goto('/sign-in')
  await page.getByLabel('Email', { exact: true }).fill('connected-e2e@dashstack.app')
  await page.getByLabel('Password', { exact: true }).fill('secret42')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL(/\/vocab\/decks$/, { timeout: 15_000 })
  await page.goto('/user/settings')
  await page.getByRole('link', { name: 'Connected accounts', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Connect Google' })).toBeVisible()

  let authorizeLocation = ''
  let startStatus = 0
  await page.route('**/api/auth/oauth/start', async (route) => {
    const response = await route.fetch({ maxRedirects: 0 })
    startStatus = response.status()
    authorizeLocation = response.headers().location ?? ''
    const headers = { ...response.headers() }
    delete headers.location
    await route.fulfill({ response, status: 200, headers, contentType: 'text/html', body: '<h1>Provider confirmation</h1>' })
  })
  await page.getByRole('button', { name: 'Connect Google' }).click()
  await expect(page.getByRole('heading', { name: 'Provider confirmation' })).toBeVisible()
  expect(startStatus).toBe(303)
  const authorize = new URL(authorizeLocation)
  expect(authorize.searchParams.get('prompt')).toBe('login')
  expect(authorize.searchParams.get('code_challenge_method')).toBe('S256')
  const state = authorize.searchParams.get('state')
  expect(state).toMatch(/^[A-Za-z0-9_-]{43}$/)
  const flow = (await context.cookies()).find((cookie) => cookie.name === `oauth_flow_${state}`)
  expect(flow?.httpOnly).toBe(true)
  expect(flow?.value).toContain('sessionHash')

  await page.goto(`/api/auth/oauth/callback?state=${state}&error=access_denied`)
  await expect(
    page.getByText(
      'Could not connect this account. It may already be connected to another user, or the confirmation expired. Try again.'
    )
  ).toBeVisible()
  const result = await context.request.get('/api/proxy/auth/accounts')
  expect(result.ok()).toBeTruthy()
  expect(await result.json()).toEqual({ providers: [] })
})
