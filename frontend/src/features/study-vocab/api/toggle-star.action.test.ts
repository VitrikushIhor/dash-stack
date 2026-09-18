import { revalidateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { vocabServerApi } from '@/entities/vocab/server'
import { toggleStarAction } from './toggle-star.action'

vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }))
vi.mock('@/entities/vocab/server', () => ({
  vocabServerApi: { setStar: vi.fn() },
}))

describe('toggleStarAction', () => {
  beforeEach(() => vi.clearAllMocks())

  it('should_save_the_desired_state_without_revalidating_the_active_route', async () => {
    vi.mocked(vocabServerApi.setStar).mockResolvedValue({
      flashcardId: 'card-1',
      isStarred: true,
    })

    const result = await toggleStarAction({
      cardId: 'card-1',
      isStarred: true,
    })

    expect(result).toEqual({
      success: true,
      data: { flashcardId: 'card-1', isStarred: true },
    })
    expect(vocabServerApi.setStar).toHaveBeenCalledWith('card-1', {
      isStarred: true,
    })
    expect(revalidateTag).not.toHaveBeenCalled()
  })
})
