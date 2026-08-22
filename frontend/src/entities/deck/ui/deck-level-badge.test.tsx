import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CEFRLevelEnum } from '../model/types'
import { DeckLevelBadge } from './deck-level-badge'

describe('DeckLevelBadge', () => {
  it('renders level badge correctly for B2', () => {
    render(<DeckLevelBadge level={CEFRLevelEnum.B2} />)
    expect(screen.getByText('B2')).toBeDefined()
  })

  it('renders level badge correctly for A1', () => {
    render(<DeckLevelBadge level={CEFRLevelEnum.A1} />)
    expect(screen.getByText('A1')).toBeDefined()
  })

  it('renders null when level is null or undefined', () => {
    const { container } = render(<DeckLevelBadge level={null} />)
    expect(container.firstChild).toBeNull()
  })
})
