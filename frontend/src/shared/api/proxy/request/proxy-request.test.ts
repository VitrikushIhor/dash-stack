import { NextRequest } from 'next/server'
import { describe, expect, it, vi } from 'vitest'
import { isTrustedMutation } from './proxy-request'

vi.mock('@/shared/config/env', () => ({
  env: {
    NODE_ENV: 'production',
    NEXT_PUBLIC_APP_URL: 'https://app.example.com',
  },
}))

describe('proxy mutation origin validation', () => {
  it('should_accept_the_configured_origin_in_production', () => {
    const request = new NextRequest(
      'https://internal.example/api/proxy/tasks',
      {
        method: 'POST',
        headers: {
          origin: 'https://app.example.com',
          'sec-fetch-site': 'same-origin',
        },
      }
    )

    expect(isTrustedMutation(request)).toBe(true)
  })

  it('should_reject_a_spoofed_host_origin_in_production', () => {
    const request = new NextRequest(
      'https://internal.example/api/proxy/tasks',
      {
        method: 'POST',
        headers: {
          host: 'evil.example',
          origin: 'https://evil.example',
          'sec-fetch-site': 'same-origin',
        },
      }
    )

    expect(isTrustedMutation(request)).toBe(false)
  })

  it('should_reject_a_local_origin_in_production', () => {
    const request = new NextRequest(
      'https://internal.example/api/proxy/tasks',
      {
        method: 'POST',
        headers: {
          origin: 'http://localhost:3000',
          'sec-fetch-site': 'same-origin',
        },
      }
    )

    expect(isTrustedMutation(request)).toBe(false)
  })
})
