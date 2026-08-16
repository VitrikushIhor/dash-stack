import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAction } from '@/shared/lib'
import { type LabelDto } from '@/entities/label'
import { createLabelAction } from '../api/create-label.action'
import { updateLabelAction } from '../api/update-label.action'
import { LabelForm } from './label-form'

if (typeof window !== 'undefined') {
  window.HTMLElement.prototype.hasPointerCapture = vi.fn()
  window.HTMLElement.prototype.releasePointerCapture = vi.fn()
  window.HTMLElement.prototype.setPointerCapture = vi.fn()
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
}

const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}))

vi.mock('@/shared/lib', () => ({
  useAction: vi.fn(),
}))

vi.mock('../api/create-label.action', () => ({
  createLabelAction: vi.fn(),
}))

vi.mock('../api/update-label.action', () => ({
  updateLabelAction: vi.fn(),
}))

interface ActionOptions<TOutput> {
  onSuccess?: (data: TOutput) => void
  onError?: (error: string) => void
  successMessage?: string
}

describe('LabelForm', () => {
  const mockCreateExecute = vi.fn()
  const mockUpdateExecute = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useAction).mockImplementation(
      <TInput, TOutput>(
        action: (
          input: TInput
        ) => Promise<{ success: boolean; data?: TOutput; error?: string }>,
        _options?: ActionOptions<TOutput>
      ) => {
        if ((action as object) === createLabelAction) {
          return {
            execute: mockCreateExecute as (
              input: TInput
            ) => Promise<TOutput | undefined>,
            isPending: false,
          }
        }
        if ((action as object) === updateLabelAction) {
          return {
            execute: mockUpdateExecute as (
              input: TInput
            ) => Promise<TOutput | undefined>,
            isPending: false,
          }
        }
        return {
          execute: vi.fn() as (input: TInput) => Promise<TOutput | undefined>,
          isPending: false,
        }
      }
    )
  })

  it('renders correctly for creating a new label with disabled submit button', () => {
    render(<LabelForm />)

    const nameInput = screen.getByRole('textbox', { name: /name/i })
    expect(nameInput).toHaveValue('')

    const submitButton = screen.getByRole('button', { name: /save/i })
    expect(submitButton).toBeDisabled()
  })

  it('renders pre-filled data when initialData is provided', () => {
    const initialData: LabelDto = {
      id: '1',
      name: 'Bug',
      color: 'red',
      organizationId: 'org-1',
    }
    render(<LabelForm initialData={initialData} submitLabel='Update' />)

    const nameInput = screen.getByRole('textbox', { name: /name/i })
    expect(nameInput).toHaveValue('Bug')

    const submitButton = screen.getByRole('button', { name: /update/i })
    expect(submitButton).toBeDisabled()
  })

  it('enables the submit button when the user types in the name field', async () => {
    const user = userEvent.setup()
    render(<LabelForm />)

    const submitButton = screen.getByRole('button', { name: /save/i })
    expect(submitButton).toBeDisabled()

    const nameInput = screen.getByRole('textbox', { name: /name/i })
    await user.type(nameInput, 'Feature')

    expect(submitButton).toBeEnabled()
  })

  it('calls execute for create when submitting a new label', async () => {
    const user = userEvent.setup()
    const onSuccessMock = vi.fn()

    let capturedOnSuccess: (() => void) | undefined
    vi.mocked(useAction).mockImplementation(
      <TInput, TOutput>(
        action: (
          input: TInput
        ) => Promise<{ success: boolean; data?: TOutput; error?: string }>,
        options?: ActionOptions<TOutput>
      ) => {
        if ((action as object) === createLabelAction) {
          capturedOnSuccess = options?.onSuccess as (() => void) | undefined
          return {
            execute: mockCreateExecute as (
              input: TInput
            ) => Promise<TOutput | undefined>,
            isPending: false,
          }
        }
        if ((action as object) === updateLabelAction) {
          return {
            execute: mockUpdateExecute as (
              input: TInput
            ) => Promise<TOutput | undefined>,
            isPending: false,
          }
        }
        return {
          execute: vi.fn() as (input: TInput) => Promise<TOutput | undefined>,
          isPending: false,
        }
      }
    )

    mockCreateExecute.mockImplementation(async () => {
      capturedOnSuccess?.()
    })

    render(<LabelForm onSuccess={onSuccessMock} />)

    const nameInput = screen.getByRole('textbox', { name: /name/i })
    await user.type(nameInput, 'New Label')

    const colorTrigger = screen.getByRole('combobox', { name: /color/i })
    await user.click(colorTrigger)

    const blueOption = screen.getByRole('option', { name: /blue/i })
    await user.click(blueOption)

    const submitButton = screen.getByRole('button', { name: /save/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreateExecute).toHaveBeenCalledWith({
        name: 'New Label',
        color: 'blue',
      })
    })

    expect(onSuccessMock).toHaveBeenCalled()
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('calls execute for update when submitting changes to an existing label', async () => {
    const user = userEvent.setup()
    const initialData: LabelDto = {
      id: 'label-123',
      name: 'Old Name',
      color: 'red',
      organizationId: 'org-1',
    }

    render(<LabelForm initialData={initialData} />)

    const nameInput = screen.getByRole('textbox', { name: /name/i })

    await user.clear(nameInput)
    await user.type(nameInput, 'Updated Name')

    const submitButton = screen.getByRole('button', { name: /save/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUpdateExecute).toHaveBeenCalledWith({
        id: 'label-123',
        dto: { name: 'Updated Name', color: 'red' },
      })
    })
  })

  it('displays saving state and disables button when isPending is true', () => {
    vi.mocked(useAction).mockReturnValue({
      execute: vi.fn(),
      isPending: true,
    })

    render(<LabelForm />)

    const submitButton = screen.getByRole('button', { name: /saving/i })
    expect(submitButton).toBeDisabled()
  })
})
