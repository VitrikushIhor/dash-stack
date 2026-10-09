import { describe, expect, it } from 'vitest'
import config from '../../../playwright.config'

describe('Playwright browser test configuration', () => {
  it('does_not_reuse_existing_local_servers', () => {
    const servers = Array.isArray(config.webServer)
      ? config.webServer
      : config.webServer
        ? [config.webServer]
        : []

    expect(servers).toHaveLength(2)
    expect(
      servers.every((server) => server.reuseExistingServer === false)
    ).toBe(true)
  })
})
