import { describe, expect, it, vi } from 'vitest'
import { labelServerApi } from '../label-api.server'
import { getOrganizationLabels } from './get-labels.server'

vi.mock('../label-api.server', () => ({
  labelServerApi: { findAll: vi.fn() },
}))

describe('getOrganizationLabels', () => {
  it('should_reject_invalid_organization_slug_before_loading_labels', async () => {
    const result = await getOrganizationLabels('../admin')

    expect(result).toMatchObject({
      ok: false,
      error: { code: 'VALIDATION' },
    })
    expect(labelServerApi.findAll).not.toHaveBeenCalled()
  })
})
