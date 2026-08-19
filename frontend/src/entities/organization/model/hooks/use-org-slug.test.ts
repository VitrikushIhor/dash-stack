import { useParams } from 'next/navigation'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useOrgSlug } from './use-org-slug'

vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
}))

describe('useOrgSlug', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns slug from useParams({ slug: "acme-corp" })', () => {
    vi.mocked(useParams).mockReturnValue({ slug: 'acme-corp' })

    const { result } = renderHook(() => useOrgSlug())

    expect(result.current).toBe('acme-corp')
  })

  it('returns undefined if invoked outside of an organization slug route', () => {
    vi.mocked(useParams).mockReturnValue({})

    const { result } = renderHook(() => useOrgSlug())

    expect(result.current).toBeUndefined()
  })
})
