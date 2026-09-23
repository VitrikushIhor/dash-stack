import { describe, expect, it } from 'vitest'
import { canStartStudySync } from './study-sync-guard'

describe('canStartStudySync', () => {
  it('should_start_when_pending_and_the_session_is_ready', () => {
    expect(
      canStartStudySync({
        isPending: true,
        isSyncing: false,
        isIdentityLoading: false,
        isEnabled: true,
      })
    ).toBe(true)
  })

  it.each([
    {
      name: 'the operation is not pending',
      input: {
        isPending: false,
        isSyncing: false,
        isIdentityLoading: false,
        isEnabled: true,
      },
    },
    {
      name: 'another operation is in progress',
      input: {
        isPending: true,
        isSyncing: true,
        isIdentityLoading: false,
        isEnabled: true,
      },
    },
    {
      name: 'the identity is still loading',
      input: {
        isPending: true,
        isSyncing: false,
        isIdentityLoading: true,
        isEnabled: true,
      },
    },
    {
      name: 'sync is disabled for the current mode',
      input: {
        isPending: true,
        isSyncing: false,
        isIdentityLoading: false,
        isEnabled: false,
      },
    },
  ])('should_not_start_when $name', ({ input }) => {
    expect(canStartStudySync(input)).toBe(false)
  })
})
