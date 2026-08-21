import { describe, expect, it } from 'vitest'
import { type Membership, OrgRole } from '@/shared/model'
import { type Label } from '@/entities/label'
import { generateFilterOptions } from './filters'

describe('generateFilterOptions', () => {
  it('generates options correctly', () => {
    const mockMembers: Membership[] = [
      {
        id: 'mem-1',
        role: OrgRole.ADMIN,
        orgId: 'org-1',
        userId: 'user-1',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          firstName: 'Test',
        },
        createdAt: '2024-01-01T00:00:00Z',
      },
    ]

    const mockLabels: Label[] = [{ id: 'lab-1', name: 'bug', color: 'red' }]

    const options = generateFilterOptions(mockMembers, mockLabels)

    expect(options.members).toHaveLength(1)
    expect(options.members[0]).toEqual({ label: 'Test', value: 'user-1' })

    expect(options.labels).toHaveLength(1)
    expect(options.labels[0]).toEqual({ label: 'bug', value: 'bug' })

    expect(options.status.length).toBeGreaterThan(0)
  })
})
