import { create } from 'zustand'

interface CreateOrganizationModalState {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useCreateOrganizationModalStore =
  create<CreateOrganizationModalState>((set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
  }))
