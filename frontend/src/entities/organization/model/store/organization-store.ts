import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface OrganizationState {
  activeOrgId: string | null
  setActiveOrgId: (id: string | null) => void
}

export const useOrgStore = create<OrganizationState>()(
  persist(
    (set) => ({
      activeOrgId: null,
      setActiveOrgId: (id) => set({ activeOrgId: id }),
    }),
    {
      name: 'org-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
