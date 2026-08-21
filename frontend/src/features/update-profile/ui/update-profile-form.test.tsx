import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type User } from '@/entities/user'
import { useUpdateProfile } from '../model/use-update-profile'
import { UpdateProfileForm } from './update-profile-form'

vi.mock('../model/use-update-profile', () => ({
  useUpdateProfile: vi.fn(),
}))

describe('UpdateProfileForm', () => {
  const mockUser: User = {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    bio: 'Software engineer',
    dob: '1990-01-01',
    avatar: null,
    urls: ['https://example.com'],
  }

  const mockUpdateProfile = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useUpdateProfile).mockReturnValue({
      updateProfile: mockUpdateProfile,
      isPending: false,
    })
  })

  it('renders pre-populated user fields', () => {
    render(<UpdateProfileForm user={mockUser} />)

    expect(screen.getByLabelText(/first name/i)).toHaveValue('John')
    expect(screen.getByLabelText(/last name/i)).toHaveValue('Doe')
    expect(screen.getByLabelText(/email address/i)).toHaveValue(
      'john.doe@example.com'
    )
    expect(screen.getByLabelText(/bio/i)).toHaveValue('Software engineer')
  })

  it('submits updated profile data when user changes input and clicks save', async () => {
    const user = userEvent.setup()
    mockUpdateProfile.mockResolvedValue(true)

    render(<UpdateProfileForm user={mockUser} />)

    const firstNameInput = screen.getByLabelText(/first name/i)
    await user.clear(firstNameInput)
    await user.type(firstNameInput, 'Johnny')

    const saveBtn = screen.getByRole('button', { name: /update profile/i })
    await user.click(saveBtn)

    expect(mockUpdateProfile).toHaveBeenCalledWith(
      mockUser,
      expect.objectContaining({
        firstName: 'Johnny',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      }),
      expect.any(Object)
    )
  })

  it('displays loading state and disables submit button when isPending is true', () => {
    vi.mocked(useUpdateProfile).mockReturnValue({
      updateProfile: mockUpdateProfile,
      isPending: true,
    })

    render(<UpdateProfileForm user={mockUser} />)

    const saveBtn = screen.getByRole('button', { name: /saving\.\.\./i })
    expect(saveBtn).toBeDisabled()
  })
})
