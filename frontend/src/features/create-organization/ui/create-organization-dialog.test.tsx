import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NuqsTestingAdapter, type UrlUpdateEvent } from 'nuqs/adapters/testing'
import { describe, expect, it, vi } from 'vitest'
import { CreateOrganizationButton } from './create-organization-button'
import { CreateOrganizationDialog } from './create-organization-dialog'

vi.mock('./create-organization-form', () => ({
  CreateOrganizationForm: () => <div>Organization form</div>,
}))

describe('CreateOrganizationDialog', () => {
  it('should_open_from_url_and_preserve_other_parameters_when_closed', async () => {
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>()
    render(
      <NuqsTestingAdapter
        searchParams='?page=2&create-organization=true'
        onUrlUpdate={onUrlUpdate}
        hasMemory
      >
        <CreateOrganizationDialog />
      </NuqsTestingAdapter>
    )

    expect(screen.getByText('Organization form')).toBeInTheDocument()
    await userEvent.setup().click(screen.getByRole('button', { name: 'Close' }))
    await waitFor(() =>
      expect(onUrlUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ queryString: '?page=2' })
      )
    )
  })

  it('should_open_from_button_using_url_state', async () => {
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>()
    render(
      <NuqsTestingAdapter onUrlUpdate={onUrlUpdate} hasMemory>
        <CreateOrganizationButton />
        <CreateOrganizationDialog />
      </NuqsTestingAdapter>
    )

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Create Organization' }))
    await waitFor(() =>
      expect(onUrlUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ queryString: '?create-organization=true' })
      )
    )
  })
})
