'use client'

import { useMemo } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/shared/ui/core/button'
import { Input } from '@/shared/ui/core/input'
import { type Label } from '@/entities/label'
import { type Membership } from '@/entities/organization'
import { generateFilterOptions } from '../lib/filters'
import { useTasksTableSearchParams } from '../model/use-search-params'
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

  const [params, setParams] = useTasksTableSearchParams()

  const isFiltered =
    params.status.length > 0 ||
    params.labels.length > 0 ||
    params.members.length > 0 ||
    !!params.filter

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='Filter tasks...'
          value={params.filter ?? ''}
          onChange={(event) =>
            setParams(
              { filter: event.target.value || null },
              { throttleMs: 300 }
            )
          }
          className='h-8 w-37.5 lg:w-62.5'
        />
        <div className='flex gap-x-2'>
          {filterOptions.status.length > 0 && (
            <TaskUrlFacetedFilter
              title='Status'
              options={filterOptions.status}
              value={params.status}
              onChange={(value) => setParams({ status: value || null })}
            />
          )}
          {filterOptions.labels.length > 0 && (
            <TaskUrlFacetedFilter
              title='Label'
              options={filterOptions.labels}
              value={params.labels}
              onChange={(value) => setParams({ labels: value || null })}
            />
          )}
          {filterOptions.members.length > 0 && (
            <TaskUrlFacetedFilter
              title='Members'
              options={filterOptions.members}
              value={params.members}
              onChange={(value) => setParams({ members: value || null })}
            />
          )}
          <TaskUrlDateRangeFilter
            title='Due Date'
            value={params.dueDate}
            onChange={(value) => setParams({ dueDate: value || null })}
          />
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => {
              setParams({
                filter: null,
                status: null,
                labels: null,
                members: null,
                dueDate: null,
              })
            }}
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
