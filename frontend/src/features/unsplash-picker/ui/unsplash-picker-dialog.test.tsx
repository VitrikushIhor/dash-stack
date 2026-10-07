import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { unsplashApi } from '@/entities/deck'
import { UnsplashPickerDialog } from './unsplash-picker-dialog'

afterEach(() => vi.restoreAllMocks())

describe('UnsplashPickerDialog', () => {
  it('should_select_a_photo_and_request_closing_after_lazy_loading', async () => {
    vi.spyOn(unsplashApi, 'search').mockResolvedValue({
      results: [
        {
          id: 'photo-1',
          thumbUrl: 'https://images.unsplash.com/thumb.jpg',
          regularUrl: 'https://images.unsplash.com/photo.jpg',
          altDescription: 'Coffee',
          photographerName: 'Ada',
          photographerUrl: 'https://unsplash.com/@ada',
        },
      ],
      total: 1,
      totalPages: 1,
    })
    const user = userEvent.setup()
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const onSelectImage = vi.fn()
    const onOpenChange = vi.fn()
    render(
      <UnsplashPickerDialog
        open
        initialQuery='coffee'
        onSelectImage={onSelectImage}
        onOpenChange={onOpenChange}
      />,
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      }
    )

    await user.click(
      await screen.findByRole('button', { name: 'Select photo by Ada: Coffee' })
    )

    expect(onSelectImage).toHaveBeenCalledWith(
      'https://images.unsplash.com/photo.jpg'
    )
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('should_defer_search_until_open_and_preserve_it_when_reopened_without_a_term', async () => {
    const search = vi.spyOn(unsplashApi, 'search').mockResolvedValue({
      results: [],
      total: 0,
      totalPages: 0,
    })
    const user = userEvent.setup()
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const props = {
      open: false,
      initialQuery: 'coffee',
      onOpenChange: vi.fn(),
      onSelectImage: vi.fn(),
    }
    const { rerender } = render(<UnsplashPickerDialog {...props} />, {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    })

    expect(search).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    rerender(<UnsplashPickerDialog {...props} open />)
    const input = await screen.findByPlaceholderText(
      'Search images (e.g. coffee, mountain, dialogue)...'
    )
    expect(input).toHaveValue('coffee')
    await user.clear(input)
    await user.type(input, 'tea')
    await user.click(screen.getByRole('button', { name: 'Search' }))
    expect(search).toHaveBeenCalledWith('tea', 1, 18)

    rerender(<UnsplashPickerDialog {...props} />)
    rerender(<UnsplashPickerDialog {...props} open initialQuery='' />)

    expect(
      await screen.findByPlaceholderText(
        'Search images (e.g. coffee, mountain, dialogue)...'
      )
    ).toHaveValue('tea')
  })
})
