import { describe, expect, it, vi } from 'vitest'
import type { HttpClient } from '@/shared/api'
import { createInvitationApi } from './invitation-api'

describe('createInvitationApi', () => {
  it('should_send_invitation_token_in_post_body_without_url_exposure', async () => {
    const post = vi.fn().mockResolvedValue({ id: 'membership-1' })
    const api = createInvitationApi({ post } as unknown as HttpClient)
    const token = 'a'.repeat(43)

    await api.acceptInvite(token)

    expect(post).toHaveBeenCalledWith('/invitations/accept', { token })
  })
})
