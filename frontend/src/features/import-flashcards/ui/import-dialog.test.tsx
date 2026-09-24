import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { ImportDialog } from './import-dialog'

beforeAll(() => {
  if (typeof window !== 'undefined') {
    window.HTMLElement.prototype.hasPointerCapture = vi.fn()
    window.HTMLElement.prototype.releasePointerCapture = vi.fn()
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
  }
})

describe('import dialog', () => {
  it('should_correct_and_exclude_invalid_rows_before_confirming', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn().mockResolvedValue(true)

    render(<ImportDialog onConfirm={onConfirm} />, {
      wrapper: ({ children }) => (
        <NuqsTestingAdapter searchParams='?import-cards=true'>
          {children}
        </NuqsTestingAdapter>
      ),
    })

    await user.type(
      screen.getByLabelText('Paste text'),
      'hello,meaning\nbad,\nomit,'
    )
    await user.click(screen.getByLabelText('Separator'))
    await user.click(screen.getByRole('option', { name: 'Comma' }))
    await user.click(screen.getByRole('button', { name: 'Preview' }))
    expect(
      screen.getByRole('button', { name: 'Import 3 cards' })
    ).toBeDisabled()
    await user.type(
      screen.getByLabelText('Definition, source row 2'),
      'corrected'
    )
    await user.click(screen.getByLabelText('Exclude source row 3'))
    await user.click(screen.getByRole('button', { name: 'Import 2 cards' }))
    expect(onConfirm).toHaveBeenCalledWith(
      expect.stringMatching(/^[a-f0-9-]{36}$/),
      [
        { term: 'hello', definition: 'meaning', example: null, imageUrl: null },
        { term: 'bad', definition: 'corrected', example: null, imageUrl: null },
      ]
    )
  })
  it('should_cancel_without_persisting', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(<ImportDialog onConfirm={onConfirm} />, {
      wrapper: ({ children }) => (
        <NuqsTestingAdapter searchParams='?import-cards=true'>
          {children}
        </NuqsTestingAdapter>
      ),
    })
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
