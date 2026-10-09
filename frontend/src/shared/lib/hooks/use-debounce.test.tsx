import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useDebounce } from './use-debounce'

describe('useDebounce', () => {
  afterEach(() => vi.useRealTimers())

  it('should_honor_an_explicit_zero_delay', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 0),
      { initialProps: { value: 'first' } }
    )

    rerender({ value: 'second' })
    expect(result.current).toBe('first')

    act(() => vi.advanceTimersByTime(0))

    expect(result.current).toBe('second')
  })
})
