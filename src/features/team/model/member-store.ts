import { create } from 'zustand'
import { persist, devtools, createJSONStorage } from 'zustand/middleware'
import { type TeamMember } from '@/entities/team'

interface MemberState {
  members: TeamMember[]
  addMember: (member: TeamMember) => void
  updateMember: (id: string, member: Partial<TeamMember>) => void
  deleteMember: (id: string) => void
  clearMembers: () => void
}

export const useMemberStore = create<MemberState>()(
  devtools(
    persist(
      (set) => ({
        members: [],

        addMember: (member) =>
          set((state) => ({
            members: [...state.members, member],
          })),

        updateMember: (id, updatedMember) =>
          set((state) => ({
            members: state.members.map((m) =>
              m.id === id ? { ...m, ...updatedMember } : m
            ),
          })),

        deleteMember: (id) =>
          set((state) => ({
            members: state.members.filter((m) => m.id !== id),
          })),

        clearMembers: () => set({ members: [] }),
      }),
      {
        name: 'member-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ members: state.members }),
      }
    ),
    { name: 'MemberStore' } // Optional: name for devtools
  )
)
