import { expect, test } from '@playwright/test'

test('proxy rejects encoded structural paths and keeps a valid query on the fixed backend', async ({ request, baseURL }) => {
  if (!baseURL) throw new Error('Playwright baseURL is required')

  for (const path of ['%252e%252e', '%2f%2fevil.test', '%255c', '%2523fragment']) {
    const response = await request.get(`${baseURL}/api/proxy/health/${path}`)
    expect(response.status()).toBe(400)
  }

  const valid = await request.get(
    `${baseURL}/api/proxy/health?next=https%3A%2F%2Fevil.example%2Fsecret`,
    { headers: { 'x-forwarded-host': 'evil.example' } }
  )
  expect(valid.status()).toBe(200)
})

test('proxy rejects oversized multipart on a non-upload path before forwarding', async ({ request, baseURL }) => {
  if (!baseURL) throw new Error('Playwright baseURL is required')

  const response = await request.post(`${baseURL}/api/proxy/storage/file/extra`, {
    multipart: {
      file: { name: 'large.bin', mimeType: 'application/octet-stream', buffer: Buffer.alloc(6 * 1024 * 1024) },
    },
  })

  expect(response.status()).toBe(413)
  expect((await response.json()).code).toBe('PAYLOAD_TOO_LARGE')
})
