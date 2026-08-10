import { create } from 'zustand'

interface InviteMemberModalState {
  isOpen: boolean
  orgId: string | null
  open: (orgId: string) => void
  close: () => void
}

export const useInviteMemberModalStore = create<InviteMemberModalState>(
  (set) => ({
    isOpen: false,
    orgId: null,
    open: (orgId: string) => set({ isOpen: true, orgId }),
    close: () => set({ isOpen: false, orgId: null }),
  })
)
