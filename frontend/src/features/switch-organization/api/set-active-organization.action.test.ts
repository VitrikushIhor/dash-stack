import { revalidatePath, revalidateTag } from 'next/cache'
import { cookies } from 'next/headers'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { setActiveOrganizationAction } from './set-active-organization.action'

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

describe('setActiveOrganizationAction', () => {
  const mockSetCookie = vi.fn()
  const validCuid = 'cju1234567890123456789012'

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(cookies).mockResolvedValue({
      set: mockSetCookie,
    } as unknown as Awaited<ReturnType<typeof cookies>>)
  })

  it('sets active_org_id cookie and revalidates paths and cache tags', async () => {
    await setActiveOrganizationAction(validCuid)

    expect(mockSetCookie).toHaveBeenCalledWith(
      'active_org_id',
      validCuid,
      expect.objectContaining({ httpOnly: false })
    )
    expect(revalidateTag).toHaveBeenCalledWith(SERVER_CACHE_TAGS.organizations)
    expect(revalidateTag).toHaveBeenCalledWith(
      SERVER_CACHE_TAGS.orgDetail(validCuid)
    )
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
  })
})
