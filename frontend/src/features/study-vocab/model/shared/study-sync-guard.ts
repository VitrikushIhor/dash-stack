export type StudySyncGate = {
  isPending: boolean
  isSyncing: boolean
  isIdentityLoading: boolean
  isEnabled: boolean
}

export function canStartStudySync({
  isPending,
  isSyncing,
  isIdentityLoading,
  isEnabled,
}: StudySyncGate): boolean {
  return isPending && !isSyncing && !isIdentityLoading && isEnabled
}
