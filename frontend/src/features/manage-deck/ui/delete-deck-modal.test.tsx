import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { describe, expect, it, vi } from 'vitest'
import type { Deck } from '@/entities/deck'
import { useDeckSearchParams } from '../model/deck-search-params'
import { deleteDeckAction } from '../server'
import { DeleteDeckModal } from './delete-deck-modal'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
vi.mock('../server', () => ({
  publishDeckAction: vi.fn(),
  unpublishDeckAction: vi.fn(),
  archiveDeckAction: vi.fn(),
  restoreDeckAction: vi.fn(),
  deleteDeckAction: vi.fn(),
}))

const deck: Deck = {
  id: 'deck-1',
  ownerUserId: 'owner',
  title: 'Vocabulary',
  language: 'en',
  tags: [],
  visibility: 'PRIVATE',
  status: 'DRAFT',
  type: 'USER_GENERATED',
  createdAt: '2026-10-07',
  updatedAt: '2026-10-07',
}

function Harness() {
  const [, setParams] = useDeckSearchParams()

  return (
    <>
      <button
        onClick={() => {
          void setParams({ 'delete-deck': deck.id })
        }}
      >
        Open delete
      </button>
      <DeleteDeckModal decks={[deck]} />
    </>
  )
}

describe('DeleteDeckModal', () => {
  it('should_load_on_open_reset_confirmation_after_cancel_and_delete_the_selected_deck', async () => {
    vi.mocked(deleteDeckAction).mockResolvedValue({
      success: true,
      data: { id: deck.id },
    })
    const user = userEvent.setup()
    render(<Harness />, {
      wrapper: ({ children }) => (
        <NuqsTestingAdapter hasMemory>{children}</NuqsTestingAdapter>
      ),
    })

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Open delete' }))
    const input = await screen.findByPlaceholderText(
      'Type "DELETE" to confirm.'
    )
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled()
    await user.type(input, 'DELETE')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(deleteDeckAction).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Open delete' }))
    const reopenedInput = await screen.findByPlaceholderText(
      'Type "DELETE" to confirm.'
    )
    expect(reopenedInput).toHaveValue('')
    await user.type(reopenedInput, 'DELETE')
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(deleteDeckAction).toHaveBeenCalledWith({ id: deck.id })
    )
    await waitFor(() =>
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    )
  })
})
