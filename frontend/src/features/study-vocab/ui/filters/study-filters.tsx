'use client'

import { Button } from '@/shared/ui/core/button'
import { Checkbox } from '@/shared/ui/core/checkbox'
import { useStudySearchParams } from '../../model/filters/use-search-params'

export function StudyFilters() {
  const { filters, setFilters, isPending } = useStudySearchParams()

  return (
    <fieldset
      aria-label='Study filters'
      disabled={isPending}
      aria-busy={isPending}
      className='flex flex-wrap items-center gap-4'
    >
      <label className='flex items-center gap-2 text-sm'>
        <Checkbox
          checked={filters.onlyDue}
          onCheckedChange={(checked) =>
            setFilters({ onlyDue: checked === true })
          }
        />
        Due only
      </label>
      <label className='flex items-center gap-2 text-sm'>
        <Checkbox
          checked={filters.onlyStarred}
          onCheckedChange={(checked) =>
            setFilters({ onlyStarred: checked === true })
          }
        />
        Starred only
      </label>
      {(filters.onlyDue || filters.onlyStarred) && (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setFilters({ onlyDue: null, onlyStarred: null })}
        >
          All cards
        </Button>
      )}
      {isPending && (
        <span role='status' className='text-muted-foreground text-sm'>
          Updating cards…
        </span>
      )}
    </fieldset>
  )
}
