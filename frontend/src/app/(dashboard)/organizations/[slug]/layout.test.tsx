import { describe, expect, it, vi } from 'vitest'
import { getOrganizationBySlug } from '@/entities/organization/server'
import TenantLayout from './layout'

vi.mock('@/entities/organization/server', () => ({
  getOrganizationBySlug: vi.fn(),
}))

describe('TenantLayout', () => {
  it('should_show_page_error_when_organization_lookup_fails', async () => {
    vi.mocked(getOrganizationBySlug).mockResolvedValue({
      ok: false,
      error: { code: 'UNKNOWN', message: 'Organization unavailable' },
    })

    const view = await TenantLayout({
      params: Promise.resolve({ slug: 'acme-corp' }),
      children: null,
    })

    expect(view.props).toEqual({
      error: { code: 'UNKNOWN', message: 'Organization unavailable' },
    })
  })
})
