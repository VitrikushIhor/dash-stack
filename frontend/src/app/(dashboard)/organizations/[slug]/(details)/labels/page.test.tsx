import { describe, expect, it, vi } from 'vitest'
import { OrgRole } from '@/shared/model'
import { getOrganizationLabels } from '@/entities/label/server'
import { getOrganizationBySlug } from '@/entities/organization/server'
import OrganizationLabelsPage from './page'

vi.mock('@/entities/organization/server', () => ({
  getOrganizationBySlug: vi.fn(),
}))
vi.mock('@/entities/label/server', () => ({ getOrganizationLabels: vi.fn() }))

describe('OrganizationLabelsPage', () => {
  it('should_start_labels_request_before_organization_result_settles', async () => {
    let resolveOrganization!: (
      value: Awaited<ReturnType<typeof getOrganizationBySlug>>
    ) => void
    vi.mocked(getOrganizationBySlug).mockReturnValue(
      new Promise((resolve) => {
        resolveOrganization = resolve
      })
    )
    vi.mocked(getOrganizationLabels).mockResolvedValue({ ok: true, data: [] })

    const page = OrganizationLabelsPage({
      params: Promise.resolve({ slug: 'acme-corp' }),
    })

    await vi.waitFor(() =>
      expect(getOrganizationLabels).toHaveBeenCalledWith('acme-corp')
    )
    resolveOrganization({
      ok: false,
      error: { code: 'UNKNOWN', message: 'Organization unavailable' },
    })
    expect((await page).props.error.message).toBe('Organization unavailable')
  })

  it('should_show_page_error_when_labels_cannot_be_loaded', async () => {
    vi.mocked(getOrganizationBySlug).mockResolvedValue({
      ok: true,
      data: {
        id: 'org-1',
        slug: 'acme-corp',
        name: 'Acme',
        createdAt: '',
        updatedAt: '',
        currentUserRole: OrgRole.OWNER,
      },
    })
    vi.mocked(getOrganizationLabels).mockResolvedValue({
      ok: false,
      error: { code: 'UNKNOWN', message: 'Labels unavailable' },
    })

    const view = await OrganizationLabelsPage({
      params: Promise.resolve({ slug: 'acme-corp' }),
    })

    expect(view.props).toEqual({
      error: { code: 'UNKNOWN', message: 'Labels unavailable' },
      withContainer: false,
    })
  })
})
