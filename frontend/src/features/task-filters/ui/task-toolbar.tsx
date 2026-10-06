'use client'

import { useMemo } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/shared/ui/core/button'
import { Input } from '@/shared/ui/core/input'
import { type Label } from '@/entities/label'
import { type Membership } from '@/entities/organization'
import { generateFilterOptions } from '../lib/filters'
import { useTaskFiltersController } from '../model/use-task-filters-controller'
import { TaskUrlDateRangeFilter } from './task-url-date-range-filter'
import { TaskUrlFacetedFilter } from './task-url-faceted-filter'

interface TaskToolbarProps {
  labels: Label[]
  members: Membership[]
}

export function TaskToolbar({ labels, members }: TaskToolbarProps) {
  const filterOptions = useMemo(
    () => generateFilterOptions(members, labels),
    [members, labels]
  )

  const {
    filters: params,
    isFiltered,
    setSearch,
    setStatuses,
    setLabels,
    setMembers,
    setDueDateRange,
    resetFilters,
  } = useTaskFiltersController()

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='Filter tasks...'
          value={params.filter ?? ''}
          onChange={(event) => setSearch(event.target.value)}
          className='h-8 w-37.5 lg:w-62.5'
        />
        <div className='flex gap-x-2'>
          {filterOptions.status.length > 0 && (
            <TaskUrlFacetedFilter
              title='Status'
              options={filterOptions.status}
              value={params.status}
              onChange={setStatuses}
            />
          )}
          {filterOptions.labels.length > 0 && (
            <TaskUrlFacetedFilter
              title='Label'
              options={filterOptions.labels}
              value={params.labels}
              onChange={setLabels}
            />
          )}
          {filterOptions.members.length > 0 && (
            <TaskUrlFacetedFilter
              title='Members'
              options={filterOptions.members}
              value={params.members}
              onChange={setMembers}
            />
          )}
          <TaskUrlDateRangeFilter
            title='Due Date'
            value={params.dueDate}
            onChange={setDueDateRange}
          />
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={resetFilters}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <Cross2Icon className='ms-2 h-4 w-4' />
          </Button>
        )}
      </div>
    </div>
  )
}
