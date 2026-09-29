import { type Page, expect, test } from '@playwright/test'

async function signIn(page: Page) {
  await page.goto('/sign-in')
  await page.getByLabel('Email', { exact: true }).fill('admin@dashstack.app')
  await page.getByLabel('Password', { exact: true }).fill('secret42')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL(/\/vocab\/decks$/)
  await page.goto('/vocab/settings/sessions')
  await expect(
    page.getByRole('heading', { name: 'Active sessions' })
  ).toBeVisible()
}

test('should_revoke_another_session_and_then_sign_out_the_current_session', async ({
  browser,
  baseURL,
}) => {
  const contextA = await browser.newContext({ baseURL })
  const contextB = await browser.newContext({ baseURL })
  try {
    const a = await contextA.newPage()
    const b = await contextB.newPage()
    expect(
      (await contextA.request.get('/api/proxy/auth/sessions')).status()
    ).toBe(401)
    await signIn(a)
    expect(
      (await contextA.request.get('/api/proxy/auth/sessions?page=0')).status()
    ).toBe(400)
    await signIn(b)
    const currentB = b
      .getByRole('listitem')
      .filter({
        has: b.getByRole('heading', { name: 'This session', exact: true }),
      })
    const label = await currentB.getByText(/^Session /).innerText()
    await a.reload()
    const target = a.getByRole('listitem').filter({ hasText: label })
    await target
      .getByRole('button', { name: 'Sign out session', exact: true })
      .click()
    await a.getByRole('button', { name: 'Cancel' }).click()
    await expect(target).toBeVisible()
    await target
      .getByRole('button', { name: 'Sign out session', exact: true })
      .click()
    await a.getByRole('button', { name: 'Confirm sign out' }).click()
    await expect(target).toHaveCount(0)
    expect((await contextB.request.get('/api/proxy/me')).status()).toBe(401)
    expect((await contextA.request.get('/api/proxy/me')).status()).toBe(200)
    await a.screenshot({
      path: '/tmp/active-sessions-desktop.png',
      fullPage: true,
    })
    await a.setViewportSize({ width: 390, height: 844 })
    await expect(
      a.getByRole('button', { name: 'Sign out this session' })
    ).toBeVisible()
    await a.screenshot({
      path: '/tmp/active-sessions-mobile.png',
      fullPage: true,
    })
    await a.getByRole('button', { name: 'Sign out this session' }).click()
    await a.getByRole('button', { name: 'Confirm sign out' }).click()
    await expect(a).toHaveURL(/\/sign-in$/)
    expect(
      (await contextA.cookies()).filter((cookie) =>
        ['access_token', 'refresh_token'].includes(cookie.name)
      )
    ).toHaveLength(0)
  } finally {
    await contextA.close()
    await contextB.close()
  }
})
