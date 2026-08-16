import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAction } from '@/shared/lib'
import { type LabelDto } from '@/entities/label'
import { useLabelSearchParams } from '../model/label-search-params'
import { DeleteLabelDialog } from './delete-label-dialog'

const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}))

vi.mock('@/shared/lib', () => ({
  useAction: vi.fn(),
}))

vi.mock('../api/delete-label.action', () => ({
  deleteLabelAction: vi.fn(),
}))

vi.mock('../model/label-search-params', () => ({
  useLabelSearchParams: vi.fn(),
}))

describe('DeleteLabelDialog', () => {
  const mockExecute = vi.fn()
  const mockSetParams = vi.fn()
  const mockLabels: LabelDto[] = [
    {
      id: '1',
      name: 'Critical Bug',
      color: 'red',
      organizationId: 'org-1',
    },
    {
      id: '2',
      name: 'Feature',
      color: 'blue',
      organizationId: 'org-1',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    // Default nuqs state (closed)
    vi.mocked(useLabelSearchParams).mockReturnValue([
      { 'create-label': false, 'update-label': null, 'delete-label': null },
      mockSetParams,
    ])

    // Default useAction state
    vi.mocked(useAction).mockReturnValue({
      execute: mockExecute,
      isPending: false,
    })
  })

  it('does not render when delete-label is not set', () => {
    render(<DeleteLabelDialog labels={mockLabels} />)
    const dialog = screen.queryByRole('alertdialog')
    expect(dialog).not.toBeInTheDocument()
  })

  it('renders correctly when delete-label matches a label', () => {
    vi.mocked(useLabelSearchParams).mockReturnValue([
      { 'create-label': false, 'update-label': null, 'delete-label': '1' },
      mockSetParams,
    ])

    render(<DeleteLabelDialog labels={mockLabels} />)

    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText(/Delete Label/i)).toBeInTheDocument()
    expect(screen.getByText(/Critical Bug/i)).toBeInTheDocument()
  })

  it('closes the dialog when Cancel is clicked', async () => {
    const user = userEvent.setup()

    vi.mocked(useLabelSearchParams).mockReturnValue([
      { 'create-label': false, 'update-label': null, 'delete-label': '1' },
      mockSetParams,
    ])

    render(<DeleteLabelDialog labels={mockLabels} />)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(mockSetParams).toHaveBeenCalledWith({ 'delete-label': null })
  })

  it('calls execute when Confirm is clicked', async () => {
    const user = userEvent.setup()

    vi.mocked(useLabelSearchParams).mockReturnValue([
      { 'create-label': false, 'update-label': null, 'delete-label': '1' },
      mockSetParams,
    ])

    let capturedOnSuccess: ((data: boolean) => void) | undefined
    vi.mocked(useAction).mockImplementation((_action, options) => {
      capturedOnSuccess = options?.onSuccess as
        | ((data: boolean) => void)
        | undefined
      return {
        execute: mockExecute,
        isPending: false,
      }
    })

    mockExecute.mockImplementation(async () => {
      capturedOnSuccess?.(true)
    })

    render(<DeleteLabelDialog labels={mockLabels} />)

    const confirmButton = screen.getByRole('button', { name: /delete/i })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledWith({ id: '1' })
    })

    expect(mockSetParams).toHaveBeenCalledWith({ 'delete-label': null })
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('displays loading state and disables buttons when isPending is true', () => {
    vi.mocked(useLabelSearchParams).mockReturnValue([
      { 'create-label': false, 'update-label': null, 'delete-label': '1' },
      mockSetParams,
    ])

    vi.mocked(useAction).mockReturnValue({
      execute: mockExecute,
      isPending: true,
    })

    render(<DeleteLabelDialog labels={mockLabels} />)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    const confirmButton = screen.getByRole('button', { name: /deleting/i })

    expect(cancelButton).toBeDisabled()
    expect(confirmButton).toBeDisabled()
  })
})
