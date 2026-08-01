import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DirectionScript } from './direction-script'
import {
  DEFAULT_DIRECTION,
  DIRECTION_COOKIE_NAME,
  directions,
} from './direction-utils'

vi.mock('next/script', () => {
  return {
    default: (props: Record<string, unknown>) => (
      <script
        data-testid='next-script'
        id={props.id as string}
        dangerouslySetInnerHTML={
          props.dangerouslySetInnerHTML as { __html: string }
        }
      />
    ),
  }
})

describe('DirectionScript', () => {
  it('renders a script tag with the correct ID', () => {
    render(<DirectionScript />)
    const scriptEl = screen.getByTestId('next-script')
    expect(scriptEl.getAttribute('id')).toBe('direction-preference')
  })

  it('injects variables securely using JSON.stringify (SEC-03 check)', () => {
    render(<DirectionScript />)
    const scriptEl = screen.getByTestId('next-script')

    const html = scriptEl.innerHTML

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
    render(<DirectionScript />)
    const scriptEl = screen.getByTestId('next-script')
    const html = scriptEl.innerHTML

    expect(html).toContain('document.cookie.match')
    expect(html).toContain('decodeURIComponent')
    expect(html).toContain("document.documentElement.setAttribute('dir', dir)")
    expect(html).toContain('catch')
  })
})
