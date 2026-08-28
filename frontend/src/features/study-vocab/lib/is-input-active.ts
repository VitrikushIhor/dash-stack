export function isInputActive(): boolean {
  if (typeof document === 'undefined') return false
  const activeEl = document.activeElement as HTMLElement | null
  return Boolean(
    activeEl?.tagName === 'INPUT' ||
    activeEl?.tagName === 'TEXTAREA' ||
    activeEl?.isContentEditable ||
    activeEl?.getAttribute('contenteditable') === 'true'
  )
}
