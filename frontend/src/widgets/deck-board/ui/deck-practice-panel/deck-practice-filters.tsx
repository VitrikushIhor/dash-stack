import { Alert, AlertDescription } from '@/shared/ui/core/alert'
import { Button } from '@/shared/ui/core/button'
import { Checkbox } from '@/shared/ui/core/checkbox'

export type StudyFilterValues = {
  onlyDue: boolean
  onlyStarred: boolean
}

export type StudyFilterUpdate = {
  onlyDue?: boolean | null
  onlyStarred?: boolean | null
}

type DeckPracticeFiltersProps = {
  dueCount: number
  starredCount: number
  filters: StudyFilterValues
  isAuthenticated: boolean
  isPending: boolean
  onFiltersChange: (filters: StudyFilterUpdate) => void
}

export const DeckPracticeFilters = ({
  dueCount,
  starredCount,
  filters,
  isAuthenticated,
  isPending,
  onFiltersChange,
}: DeckPracticeFiltersProps) => {
  if (!isAuthenticated) {
    return (
      <Alert>
        <AlertDescription>
          Sign in to study due or starred cards. You can study all cards as a
          guest.
        </AlertDescription>
      </Alert>
    )
  }

  const hasActiveFilters = filters.onlyDue || filters.onlyStarred

  return (
    <fieldset
      disabled={isPending}
      className='space-y-2'
      aria-label='Study filters'
    >
      <label className='hover:bg-muted flex cursor-pointer items-center justify-between rounded-lg border p-3'>
        <span className='flex items-center gap-3'>
          <Checkbox
            checked={filters.onlyDue}
            onCheckedChange={(value) =>
              onFiltersChange({
                onlyDue: value === true,
              })
            }
          />
          Due only
        </span>

        <span className='text-muted-foreground text-sm'>{dueCount}</span>
      </label>

      <label className='hover:bg-muted flex cursor-pointer items-center justify-between rounded-lg border p-3'>
        <span className='flex items-center gap-3'>
          <Checkbox
            checked={filters.onlyStarred}
            onCheckedChange={(value) =>
              onFiltersChange({
                onlyStarred: value === true,
              })
            }
          />
          Starred only
        </span>

        <span className='text-muted-foreground text-sm'>{starredCount}</span>
      </label>

      {hasActiveFilters && (
        <Button
          variant='ghost'
          size='sm'
          onClick={() =>
            onFiltersChange({
              onlyDue: null,
              onlyStarred: null,
            })
          }
        >
          Use all cards
        </Button>
      )}
    </fieldset>
  )
}
