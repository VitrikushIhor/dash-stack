import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DirectionScript } from './direction-script'
import {
  DEFAULT_DIRECTION,
  DIRECTION_COOKIE_NAME,
  directions,
} from './direction-utils'

describe('DirectionScript', () => {
  it('renders a script tag with the correct ID', () => {
    const { container } = render(<DirectionScript />)
    const scriptEl = container.querySelector('#direction-preference')
    expect(scriptEl).not.toBeNull()
    expect(scriptEl?.getAttribute('id')).toBe('direction-preference')
  })

  it('injects variables securely using JSON.stringify (SEC-03 check)', () => {
    const { container } = render(<DirectionScript />)
    const scriptEl = container.querySelector('#direction-preference')

    const html = scriptEl?.innerHTML || ''

    expect(html).toContain(
      `var cookieName = ${JSON.stringify(DIRECTION_COOKIE_NAME)};`
    )
    expect(html).toContain(
      `var defaultDir = ${JSON.stringify(DEFAULT_DIRECTION)};`
    )
    expect(html).toContain(
      `var allowedDirections = ${JSON.stringify(directions)};`
    )
  })

  it('contains the correct logic to parse the cookie and set the attribute', () => {
    const { container } = render(<DirectionScript />)
    const scriptEl = container.querySelector('#direction-preference')
    const html = scriptEl?.innerHTML || ''

    expect(html).toContain('document.cookie.match')
    expect(html).toContain('decodeURIComponent')
    expect(html).toContain("document.documentElement.setAttribute('dir', dir)")
    expect(html).toContain('catch')
  })
})
