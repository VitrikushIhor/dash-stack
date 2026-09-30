import { expect, test } from '@playwright/test'

test('sibling-site forms cannot mutate BFF auth endpoints', async ({ page, context, baseURL }) => {
  if (!baseURL) throw new Error('Playwright baseURL is required')
  const target = new URL(baseURL)
  target.hostname = 'app.lvh.me'
  const backendUrl = process.env.E2E_BACKEND_URL ?? 'http://127.0.0.1:8000/api'
  const login = await context.request.post(`${backendUrl}/auth/login`, {
    data: { email: 'admin@dashstack.app', password: 'secret42' },
  })
  expect(login.status()).toBe(200)
  const setCookies = login.headersArray().filter((header) => header.name.toLowerCase() === 'set-cookie')
  const authCookies = ['access_token', 'refresh_token'].map((name) => {
    const header = setCookies.find((entry) => entry.value.startsWith(`${name}=`))
    if (!header) throw new Error(`Missing ${name} cookie`)
    return {
      name,
      value: header.value.slice(name.length + 1).split(';', 1)[0],
      url: target.origin,
      httpOnly: true,
      sameSite: 'Lax' as const,
    }
  })
  await context.addCookies(authCookies)
  const profile = await context.request.get(`${target.origin}/api/proxy/me`)
  expect(profile.status()).toBe(200)

  const siblingOrigin = `${target.protocol}//sibling.lvh.me:${target.port}`
  const attackUrl = `${siblingOrigin}/attack`
  for (const endpoint of ['login', 'refresh', 'logout', 'oauth/code']) {
    const targetUrl = `${target.origin}/api/proxy/auth/${endpoint}`
    await context.route(attackUrl, (route) =>
      route.fulfill({
        contentType: 'text/html',
        body: `<form method="POST" action="${targetUrl}"><input name="email" value="attacker@example.com"><input name="password" value="bad-password"><button>Submit</button></form>`,
      })
    )

    await page.goto(attackUrl)
    const requestPromise = page.waitForRequest((request) => request.url() === targetUrl)
    const responsePromise = page.waitForResponse((response) => response.url() === targetUrl)
    await page.getByRole('button', { name: 'Submit' }).click()
    const request = await requestPromise
    const response = await responsePromise
    const headers = await request.allHeaders()
    expect(headers.origin).toBe(siblingOrigin)
    expect(headers.cookie).toContain('access_token=')
    expect(response.status()).toBe(403)
    await context.unroute(attackUrl)
  }

  const sessionAfterAttack = await context.request.get(`${target.origin}/api/proxy/me`)
  expect(sessionAfterAttack.status()).toBe(200)
})

test('sibling-site forms cannot mutate direct Nest auth endpoints', async ({ page, context }) => {
  const backendUrl = process.env.E2E_BACKEND_URL ?? 'http://127.0.0.1:8000/api'
  const backend = new URL(backendUrl)
  backend.hostname = 'api.lvh.me'
  const siblingOrigin = `${backend.protocol}//sibling.lvh.me:${backend.port}`
  const login = await context.request.post(`${backendUrl.replace(/\/$/, '')}/auth/login`, {
    data: { email: 'admin@dashstack.app', password: 'secret42' },
  })
  expect(login.status()).toBe(200)
  const cookies = login.headersArray().filter((header) => header.name.toLowerCase() === 'set-cookie')
  await context.addCookies(['access_token', 'refresh_token'].map((name) => {
    const header = cookies.find((entry) => entry.value.startsWith(`${name}=`))
    if (!header) throw new Error(`Missing ${name} cookie`)
    return {
      name,
      value: header.value.slice(name.length + 1).split(';', 1)[0],
      url: backend.origin,
      httpOnly: true,
      sameSite: 'Lax' as const,
    }
  }))

  const attackUrl = `${siblingOrigin}/attack`
  for (const [endpoint, encoding] of [
    ['login', 'application/x-www-form-urlencoded'],
    ['refresh', 'application/x-www-form-urlencoded'],
    ['logout', 'multipart/form-data'],
    ['oauth/code', 'application/x-www-form-urlencoded'],
  ] as const) {
    const targetUrl = `${backend.origin}/api/auth/${endpoint}`
    await context.route(attackUrl, (route) => route.fulfill({
      contentType: 'text/html',
      body: `<form method="POST" enctype="${encoding}" action="${targetUrl}"><input name="email" value="attacker@example.com"><input name="password" value="bad-password"><button>Submit</button></form>`,
    }))
    await page.goto(attackUrl)
    const requestPromise = page.waitForRequest((request) => request.url() === targetUrl)
    const responsePromise = page.waitForResponse((response) => response.url() === targetUrl)
    await page.getByRole('button', { name: 'Submit' }).click()
    const request = await requestPromise
    const response = await responsePromise
    const headers = await request.allHeaders()
    expect(headers.origin).toBe(siblingOrigin)
    expect(headers.cookie).toContain('access_token=')
    expect(response.status()).toBe(403)
    await context.unroute(attackUrl)
  }

  const profile = await context.request.get(`${backend.origin}/api/me`)
  expect(profile.status()).toBe(200)
})
