import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DeckStatusEnum } from '../model/types'
import { DeckStatusBadge } from './deck-status-badge'

describe('DeckStatusBadge', () => {
  it('renders published status badge correctly', () => {
    render(<DeckStatusBadge status={DeckStatusEnum.PUBLISHED} />)
    expect(screen.getByText('Published')).toBeDefined()
  })

  it('renders draft status badge correctly', () => {
    render(<DeckStatusBadge status={DeckStatusEnum.DRAFT} />)
    expect(screen.getByText('Draft')).toBeDefined()
  })

  it('renders archived status badge correctly', () => {
    render(<DeckStatusBadge status={DeckStatusEnum.ARCHIVED} />)
    expect(screen.getByText('Archived')).toBeDefined()
  })
})
