import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useCreateOrganization } from '../model/use-create-organization'
import { CreateOrganizationForm } from './create-organization-form'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}))

vi.mock('../model/use-create-organization', () => ({
  useCreateOrganization: vi.fn(),
}))

describe('CreateOrganizationForm', () => {
  const mockCreateOrganization = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useCreateOrganization).mockReturnValue({
      createOrganization: mockCreateOrganization,
      isPending: false,
    })
  })

  it('renders form elements with default submit button label', () => {
    render(<CreateOrganizationForm />)

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('renders custom submit button text when provided', () => {
    render(<CreateOrganizationForm submitLabel='Save New Org' />)

    expect(
      screen.getByRole('button', { name: 'Save New Org' })
    ).toBeInTheDocument()
  })

  it('submits filled form values when submit button is clicked', async () => {
    const user = userEvent.setup()
    mockCreateOrganization.mockImplementation(async (_values, options) => {
      options?.onSuccess?.()
      return true
    })

    render(<CreateOrganizationForm />)

    const nameInput = screen.getByLabelText(/name/i)
    await user.type(nameInput, 'Stark Industries')

    const submitBtn = screen.getByRole('button', { name: 'Create' })
    await user.click(submitBtn)

    expect(mockCreateOrganization).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Stark Industries',
      }),
      expect.any(Object)
    )
  })
})
