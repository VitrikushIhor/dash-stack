import { expect, test } from '@playwright/test'

const accounts = {
  owner: { email: 'sessions-e2e@dashstack.app', password: 'secret42' },
  stranger: { email: 'connected-e2e@dashstack.app', password: 'secret42' },
} as const

async function signIn(
  page: import('@playwright/test').Page,
  account: { email: string; password: string }
) {
  await page.goto('/sign-in')
  await page.getByLabel('Email', { exact: true }).fill(account.email)
  await page.getByLabel('Password', { exact: true }).fill(account.password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL(/\/vocab\/decks$/)
}

test('private attachment download follows current browser session', async ({ browser }) => {
  const owner = await browser.newContext()
  const ownerPage = await owner.newPage()
  const stranger = await browser.newContext()
  const strangerPage = await stranger.newPage()

  try {
    await signIn(ownerPage, accounts.owner)

    const uploaded = await ownerPage.evaluate(async () => {
      const form = new FormData()
      form.set('file', new File(['private test content'], 'private.txt', { type: 'text/plain' }))
      const response = await fetch('/api/proxy/storage/file', { method: 'POST', body: form })
      return { status: response.status, body: await response.json() }
    })
    expect(uploaded.status, JSON.stringify(uploaded.body)).toBe(201)
    expect(uploaded.body.key).toMatch(/^files\/[a-f0-9-]+\.txt$/)
    expect(uploaded.body.url).toMatch(/^\/api\/proxy\/storage\/attachments\//)

    const downloadUrl = uploaded.body.url as string
    const ownerDownload = await ownerPage.request.get(downloadUrl)
    expect(ownerDownload.status()).toBe(200)
    expect(await ownerDownload.text()).toBe('private test content')
    expect(ownerDownload.headers()['content-disposition']).toMatch(/^attachment;/)
    expect(ownerDownload.headers()['content-type']).toContain('application/octet-stream')
    expect(ownerDownload.headers()['x-content-type-options']).toBe('nosniff')
    expect(ownerDownload.headers()['cache-control']).toBe('no-store')

    const publicPath = new URL(downloadUrl, ownerPage.url())
    const legacy = await ownerPage.request.get(`/uploads/${uploaded.body.key}`)
    expect(legacy.status()).toBe(404)
    expect(publicPath.pathname).toContain('/api/proxy/storage/attachments/')

    await signIn(strangerPage, accounts.stranger)
    const strangerDownload = await strangerPage.request.get(downloadUrl)
    expect(strangerDownload.status()).toBe(404)

    const guest = await browser.newContext()
    try {
      const guestDownload = await guest.request.get(new URL(downloadUrl, ownerPage.url()).href)
      expect(guestDownload.status()).toBe(401)
    } finally {
      await guest.close()
    }
  } finally {
    await owner.close()
    await stranger.close()
  }
})
