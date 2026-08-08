import { beforeEach, describe, expect, it } from 'vitest'
import { useCreateOrganizationModalStore } from './use-create-organization-modal-store'

describe('useCreateOrganizationModalStore', () => {
  beforeEach(() => {
    useCreateOrganizationModalStore.setState({ isOpen: false })
  })

  it('initializes with isOpen false', () => {
    expect(useCreateOrganizationModalStore.getState().isOpen).toBe(false)
  })

  it('opens modal when open is called', () => {
    useCreateOrganizationModalStore.getState().open()
    expect(useCreateOrganizationModalStore.getState().isOpen).toBe(true)
  })

  it('closes modal when close is called', () => {
    useCreateOrganizationModalStore.getState().open()
    expect(useCreateOrganizationModalStore.getState().isOpen).toBe(true)

    useCreateOrganizationModalStore.getState().close()
    expect(useCreateOrganizationModalStore.getState().isOpen).toBe(false)
  })
})
