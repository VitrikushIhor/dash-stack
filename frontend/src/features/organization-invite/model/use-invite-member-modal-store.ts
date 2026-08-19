import { create } from 'zustand'

interface InviteMemberModalState {
  isOpen: boolean
  slug: string | null
  open: (slug: string) => void
  close: () => void
}

export const useInviteMemberModalStore = create<InviteMemberModalState>(
  (set) => ({
    isOpen: false,
    slug: null,
    open: (slug: string) => set({ isOpen: true, slug }),
    close: () => set({ isOpen: false, slug: null }),
  })
)
