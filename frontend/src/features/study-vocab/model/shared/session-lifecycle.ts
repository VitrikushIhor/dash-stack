export interface SessionLifecycle {
  activate: () => number
  deactivate: (lease: number) => void
}

export function createSessionLifecycle() {
  let sequence = 0
  let activeLease: number | null = null

  return {
    activate: () => {
      activeLease = ++sequence

      return activeLease
    },
    deactivate: (lease: number) => {
      if (activeLease === lease) activeLease = null
    },
    current: () => activeLease,
    isActive: (lease: number) => activeLease === lease,
  }
}
