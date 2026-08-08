import { beforeEach, describe, expect, it } from 'vitest'
import { useInviteMemberModalStore } from './use-invite-member-modal-store'

describe('useInviteMemberModalStore', () => {
  beforeEach(() => {
    useInviteMemberModalStore.setState({ isOpen: false, orgId: null })
  })

  it('initializes with isOpen false and orgId null', () => {
    const state = useInviteMemberModalStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.orgId).toBeNull()
  })

  it('opens modal with orgId when open is called', () => {
    useInviteMemberModalStore.getState().open('org-123')
    const state = useInviteMemberModalStore.getState()
    expect(state.isOpen).toBe(true)
    expect(state.orgId).toBe('org-123')
  })

  it('closes modal and clears orgId when close is called', () => {
    useInviteMemberModalStore.getState().open('org-123')
    expect(useInviteMemberModalStore.getState().isOpen).toBe(true)

    useInviteMemberModalStore.getState().close()
    const state = useInviteMemberModalStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.orgId).toBeNull()
  })
})
