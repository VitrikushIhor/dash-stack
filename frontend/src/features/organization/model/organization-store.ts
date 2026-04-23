import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OrganizationState {
  currentOrgId: string | null
  setCurrentOrgId: (orgId: string | null) => void
  clearCurrentOrg: () => void
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set) => ({
      currentOrgId: null,
      setCurrentOrgId: (orgId) => set({ currentOrgId: orgId }),
      clearCurrentOrg: () => set({ currentOrgId: null }),
    }),
    {
      name: 'organization-storage',
    }
  )
)
