export function isSafeRedirectPath(path: string | null | undefined): boolean {
  if (!path || typeof path !== 'string') return false
  if (
    !path.startsWith('/') ||
    path.startsWith('//') ||
    path.startsWith('/\\')
  ) {
    return false
  }
  if (
    path.includes('\\') ||
    path.toLowerCase().includes('javascript:') ||
    path.toLowerCase().includes('data:')
  ) {
    return false
  }

  return true
}
