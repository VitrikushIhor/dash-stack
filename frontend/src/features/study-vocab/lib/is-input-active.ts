export function isInputActive(): boolean {
  if (typeof document === 'undefined') return false
  const activeEl = document.activeElement as HTMLElement | null

  if (activeEl?.matches('[data-study-shortcut-surface="true"]')) {
    return false
  }

  return Boolean(
    activeEl?.tagName === 'INPUT' ||
    activeEl?.tagName === 'TEXTAREA' ||
    activeEl?.tagName === 'SELECT' ||
    activeEl?.tagName === 'BUTTON' ||
    activeEl?.tagName === 'A' ||
    activeEl?.getAttribute('role') === 'button' ||
    activeEl?.isContentEditable ||
    activeEl?.getAttribute('contenteditable') === 'true'
  )
}
