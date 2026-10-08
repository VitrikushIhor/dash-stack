import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NuqsTestingAdapter, type UrlUpdateEvent } from 'nuqs/adapters/testing'
import { describe, expect, it, vi } from 'vitest'
import { UrlConfirmDialog } from './url-confirm-dialog'

function setup(searchParams: string, isLoading = false, enabled = true) {
  const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>()
  const onClose = vi.fn()
  const handleConfirm = vi.fn()

  render(
    <NuqsTestingAdapter
      searchParams={searchParams}
      onUrlUpdate={onUrlUpdate}
      hasMemory
    >
      <UrlConfirmDialog.Root
        queryKey='delete-item'
        handleConfirm={handleConfirm}
        onClose={onClose}
        isLoading={isLoading}
        enabled={enabled}
      >
        <UrlConfirmDialog.Header>
          <UrlConfirmDialog.Title>Delete item?</UrlConfirmDialog.Title>
          <UrlConfirmDialog.Description>
            Confirm deletion.
          </UrlConfirmDialog.Description>
        </UrlConfirmDialog.Header>
      </UrlConfirmDialog.Root>
    </NuqsTestingAdapter>
  )

  return { onUrlUpdate, onClose, handleConfirm }
}

describe('UrlConfirmDialog', () => {
  it('should_close_and_preserve_other_params_when_cancelled', async () => {
    const { onUrlUpdate, onClose, handleConfirm } = setup(
      '?delete-item=123&page=2'
    )
    expect(screen.getByRole('alertdialog')).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
      expect(onUrlUpdate.mock.lastCall?.[0].searchParams.toString()).toBe(
        'page=2'
      )
    })
    expect(onClose).toHaveBeenCalledOnce()
    expect(handleConfirm).not.toHaveBeenCalled()
  })

  it('should_keep_dialog_open_when_confirmation_is_pending', () => {
    const { onClose, onUrlUpdate } = setup('?delete-item=123', true)

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' })

    expect(screen.getByRole('alertdialog')).toBeVisible()
    expect(onClose).not.toHaveBeenCalled()
    expect(onUrlUpdate).not.toHaveBeenCalled()
  })

  it('should_keep_dialog_closed_when_selected_item_is_unavailable', () => {
    setup('?delete-item=123', false, false)

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('should_keep_dialog_open_when_confirmation_is_requested', () => {
    const { handleConfirm, onClose } = setup('?delete-item=123')

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(handleConfirm).toHaveBeenCalledOnce()
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByRole('alertdialog')).toBeVisible()
  })
})
