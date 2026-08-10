import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { OrgRole } from '@/shared/model'
import { useCurrentUser } from '@/entities/user'
import type { Organization } from '../types/organization.types'
import { useOrganizationPermission } from './use-organization-permission'

vi.mock('@/entities/user', () => ({
  useCurrentUser: vi.fn(),
}))

describe('useOrganizationPermission', () => {
  const mockUseCurrentUser = vi.mocked(useCurrentUser)

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseCurrentUser.mockReturnValue({
      isLoading: false,
    } as ReturnType<typeof useCurrentUser>)
  })

  it('should return loading state when organization is undefined', () => {
    const { result } = renderHook(() => useOrganizationPermission(undefined))

    expect(result.current.isLoading).toBe(true)
    expect(result.current.role).toBeUndefined()
    expect(result.current.isOwner).toBe(false)
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.canManage).toBe(false)
    expect(result.current.isMember).toBe(false)
  })

  it('should return loading state when auth is loading', () => {
    mockUseCurrentUser.mockReturnValue({
      isLoading: true,
    } as ReturnType<typeof useCurrentUser>)

    const org = {
      id: 'org-1',
      name: 'Test Org',
      currentUserRole: OrgRole.MEMBER,
    } as Organization

    const { result } = renderHook(() => useOrganizationPermission(org))

    expect(result.current.isLoading).toBe(true)
    expect(result.current.role).toBe(OrgRole.MEMBER)
    expect(result.current.isMember).toBe(true)
  })

  it('should handle null organization (not found)', () => {
    const { result } = renderHook(() => useOrganizationPermission(null))

    expect(result.current.isLoading).toBe(false)
    expect(result.current.role).toBeUndefined()
    expect(result.current.isOwner).toBe(false)
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.canManage).toBe(false)
    expect(result.current.isMember).toBe(false)
  })

  it('should return correct permissions for OWNER', () => {
    const org = {
      id: 'org-1',
      name: 'Test Org',
      currentUserRole: OrgRole.OWNER,
    } as Organization
    const { result } = renderHook(() => useOrganizationPermission(org))

    expect(result.current.isLoading).toBe(false)
    expect(result.current.role).toBe(OrgRole.OWNER)
    expect(result.current.isOwner).toBe(true)
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.canManage).toBe(true)
    expect(result.current.isMember).toBe(true)
  })

  it('should return correct permissions for ADMIN', () => {
    const org = {
      id: 'org-1',
      name: 'Test Org',
      currentUserRole: OrgRole.ADMIN,
    } as Organization
    const { result } = renderHook(() => useOrganizationPermission(org))

    expect(result.current.isLoading).toBe(false)
    expect(result.current.role).toBe(OrgRole.ADMIN)
    expect(result.current.isOwner).toBe(false)
    expect(result.current.isAdmin).toBe(true)
    expect(result.current.canManage).toBe(true)
    expect(result.current.isMember).toBe(true)
  })

  it('should return correct permissions for MEMBER', () => {
    const org = {
      id: 'org-1',
      name: 'Test Org',
      currentUserRole: OrgRole.MEMBER,
    } as Organization
    const { result } = renderHook(() => useOrganizationPermission(org))

    expect(result.current.isLoading).toBe(false)
    expect(result.current.role).toBe(OrgRole.MEMBER)
    expect(result.current.isOwner).toBe(false)
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.canManage).toBe(false)
    expect(result.current.isMember).toBe(true)
  })

  it('should handle organization with no currentUserRole', () => {
    const org = { id: 'org-1', name: 'Test Org' } as Organization
    const { result } = renderHook(() => useOrganizationPermission(org))

    expect(result.current.isLoading).toBe(false)
    expect(result.current.role).toBeUndefined()
    expect(result.current.isOwner).toBe(false)
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.canManage).toBe(false)
    expect(result.current.isMember).toBe(false)
  })

  it('should handle explicit null for currentUserRole', () => {
    const org = {
      id: 'org-1',
      name: 'Test Org',
      currentUserRole: null,
    } as unknown as Organization
    const { result } = renderHook(() => useOrganizationPermission(org))

    expect(result.current.isLoading).toBe(false)
    expect(result.current.role).toBeUndefined()
    expect(result.current.isOwner).toBe(false)
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.canManage).toBe(false)
    expect(result.current.isMember).toBe(false)
  })
})
