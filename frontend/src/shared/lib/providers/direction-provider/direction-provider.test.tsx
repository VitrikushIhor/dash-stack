import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getCookie, removeCookie, setCookie } from '@/shared/lib/cookies'
import { DirectionProvider, useDirection } from './direction-provider'
import { isDirection } from './direction-utils'

vi.mock('@/shared/lib/cookies', () => ({
  getCookie: vi.fn(),
  setCookie: vi.fn(),
  removeCookie: vi.fn(),
}))

function TestComponent() {
  const { dir, defaultDir, setDir, resetDir } = useDirection()

  return (
    <div>
      <span data-testid='dir'>{dir}</span>
      <span data-testid='default-dir'>{defaultDir}</span>

      <button data-testid='set-rtl' onClick={() => setDir('rtl')}>
        Set RTL
      </button>

      <button data-testid='set-ltr' onClick={() => setDir('ltr')}>
        Set LTR
      </button>

      <button data-testid='reset-dir' onClick={resetDir}>
        Reset
      </button>
    </div>
  )
}

describe('DirectionProvider & useDirection', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    document.documentElement.removeAttribute('dir')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('TC-1: Default direction (no cookie)', () => {
    it('provides ltr direction when cookie is missing and no HTML attribute exists', () => {
      vi.mocked(getCookie).mockReturnValue(undefined)

      render(
        <DirectionProvider>
          <TestComponent />
        </DirectionProvider>
      )

      expect(screen.getByTestId('dir').textContent).toBe('ltr')
      expect(screen.getByTestId('default-dir').textContent).toBe('ltr')
      expect(document.documentElement.hasAttribute('dir')).toBe(false)
    })
  })

  describe('TC-2: Restore RTL from cookie', () => {
    it('initializes with rtl when cookie is rtl', () => {
      vi.mocked(getCookie).mockReturnValue('rtl')

      render(
        <DirectionProvider>
          <TestComponent />
        </DirectionProvider>
      )

      expect(screen.getByTestId('dir').textContent).toBe('rtl')
    })
  })

  describe('TC-3: Runtime direction switching (setDir)', () => {
    it('updates state, DOM, and cookie when setDir is called', async () => {
      const user = userEvent.setup()
      vi.mocked(getCookie).mockReturnValue(undefined)

      render(
        <DirectionProvider>
          <TestComponent />
        </DirectionProvider>
      )

      await user.click(screen.getByTestId('set-rtl'))

      expect(screen.getByTestId('dir').textContent).toBe('rtl')
      expect(document.documentElement.getAttribute('dir')).toBe('rtl')
      expect(setCookie).toHaveBeenCalledWith('dir', 'rtl', expect.any(Number))

      await user.click(screen.getByTestId('set-ltr'))

      expect(screen.getByTestId('dir').textContent).toBe('ltr')
      expect(document.documentElement.getAttribute('dir')).toBe('ltr')
      expect(setCookie).toHaveBeenCalledWith('dir', 'ltr', expect.any(Number))
    })
  })

  describe('TC-4: Reset to default (resetDir)', () => {
    it('resets to default direction, clears cookie, and updates DOM', async () => {
      const user = userEvent.setup()
      vi.mocked(getCookie).mockReturnValue('rtl')

      render(
        <DirectionProvider>
          <TestComponent />
        </DirectionProvider>
      )

      expect(screen.getByTestId('dir').textContent).toBe('rtl')

      await user.click(screen.getByTestId('reset-dir'))

      expect(screen.getByTestId('dir').textContent).toBe('ltr')
      expect(document.documentElement.getAttribute('dir')).toBe('ltr')
      expect(removeCookie).toHaveBeenCalledWith('dir')
    })
  })

  describe('TC-5: Hook usage safety', () => {
    it('throws an error if useDirection is used outside DirectionProvider', () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      function BadComponent() {
        useDirection()
        return null
      }

      expect(() => render(<BadComponent />)).toThrow(
        'useDirection must be used within a DirectionProvider'
      )

      consoleError.mockRestore()
    })
  })

  describe('TC-6: Invalid cookie fallback', () => {
    it.each([
      ['invalid'],
      [''],
      ['LTR'],
      ['TTB'],
      ['<script>alert(1)</script>'],
    ])('falls back to ltr when cookie is "%s"', (invalidValue) => {
      vi.mocked(getCookie).mockReturnValue(invalidValue)

      render(
        <DirectionProvider>
          <TestComponent />
        </DirectionProvider>
      )

      expect(screen.getByTestId('dir').textContent).toBe('ltr')
    })
  })

  describe('TC-7: Priority of HTML attribute over cookie', () => {
    it('prioritizes existing html[dir] over cookie value (Anti-FOUC script integration)', () => {
      document.documentElement.setAttribute('dir', 'rtl')
      vi.mocked(getCookie).mockReturnValue('ltr')

      render(
        <DirectionProvider>
          <TestComponent />
        </DirectionProvider>
      )

      expect(screen.getByTestId('dir').textContent).toBe('rtl')
    })
  })

  describe('TC-8: isDirection Type Guard', () => {
    it.each([
      ['ltr', true],
      ['rtl', true],
      ['LTR', false],
      ['invalid', false],
      ['', false],
      [undefined, false],
      [null, false],
      [123, false],
      [{}, false],
      [[], false],
    ])('evaluates isDirection(%j) as %s', (value, expected) => {
      expect(isDirection(value)).toBe(expected)
    })
  })
})
