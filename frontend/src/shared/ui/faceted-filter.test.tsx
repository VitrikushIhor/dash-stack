import { fireEvent, render, screen } from '@testing-library/react'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { FacetedFilter } from './faceted-filter'

describe('FacetedFilter', () => {
  const scrollDescriptor = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'scrollIntoView'
  )
  beforeAll(() =>
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    })
  )
  afterAll(() => {
    if (scrollDescriptor)
      Object.defineProperty(
        HTMLElement.prototype,
        'scrollIntoView',
        scrollDescriptor
      )
    else Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView')
  })

  it('should_toggle_selection_and_display_counts_when_facets_are_supplied', () => {
    const onChange = vi.fn()
    const props = {
      title: 'Status',
      options: [{ label: 'Planned', value: 'PLANNED' }],
      facets: new Map([['PLANNED', 3]]),
      onChange,
    }
    const { rerender } = render(<FacetedFilter {...props} value={[]} />)
    fireEvent.click(screen.getByRole('button', { name: 'Status' }))
    fireEvent.click(screen.getByRole('option', { name: /Planned.*3/ }))
    expect(onChange).toHaveBeenLastCalledWith(['PLANNED'])
    rerender(<FacetedFilter {...props} value={['PLANNED']} />)
    fireEvent.click(screen.getByRole('option', { name: /Planned.*3/ }))
    expect(onChange).toHaveBeenLastCalledWith(undefined)
    fireEvent.click(screen.getByRole('option', { name: 'Clear filters' }))
    expect(onChange).toHaveBeenLastCalledWith(undefined)
  })
})
