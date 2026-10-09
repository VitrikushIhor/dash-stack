import { endOfDay, startOfDay } from 'date-fns'
import { fireEvent, render, screen } from '@testing-library/react'
import { type DateRange } from 'react-day-picker'
import { describe, expect, it, vi } from 'vitest'
import { TaskUrlDateRangeFilter } from './task-url-date-range-filter'

const { from, to } = vi.hoisted(() => ({
  from: new Date(2026, 9, 5),
  to: new Date(2026, 9, 7),
}))
vi.mock('@/shared/ui/core/calendar', () => ({
  Calendar: ({
    onSelect,
  }: {
    onSelect: (range: DateRange | undefined) => void
  }) => (
    <>
      <button onClick={() => onSelect({ from })}>Select start</button>
      <button onClick={() => onSelect({ from, to })}>Select end</button>
    </>
  ),
}))

describe('TaskUrlDateRangeFilter', () => {
  it('should_render_safely_when_url_dates_are_invalid', () => {
    expect(() =>
      render(
        <TaskUrlDateRangeFilter
          title='Due Date'
          value={['invalid', 'NaN']}
          onChange={vi.fn()}
        />
      )
    ).not.toThrow()
  })

  it('should_preserve_first_selection_and_include_end_day_when_selecting_a_range', () => {
    const onChange = vi.fn()
    render(
      <TaskUrlDateRangeFilter title='Due Date' value={[]} onChange={onChange} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Due Date' }))
    fireEvent.click(screen.getByRole('button', { name: 'Select start' }))
    expect(onChange).toHaveBeenLastCalledWith([
      String(startOfDay(from).getTime()),
    ])
    fireEvent.click(screen.getByRole('button', { name: 'Select end' }))
    expect(onChange).toHaveBeenLastCalledWith([
      String(startOfDay(from).getTime()),
      String(endOfDay(to).getTime()),
    ])
  })
})
