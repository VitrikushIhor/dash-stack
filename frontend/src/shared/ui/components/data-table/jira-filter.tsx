import * as React from 'react'
import { CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/components/ui/badge'
import { Button } from '@/shared/ui/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/shared/ui/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/components/ui/popover'
import { Separator } from '@/shared/ui/components/ui/separator'

interface DataTableJiraFilterProps<TData> {
  table: Table<TData>
  filters: {
    columnId: string
    title: string
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[]
  }[]
}

export function DataTableJiraFilter<TData>({
  table,
  filters,
}: DataTableJiraFilterProps<TData>) {
  const [activeFilterId, setActiveFilterId] = React.useState<string | null>(
    filters[0]?.columnId ?? null
  )

  const activeFilter = React.useMemo(
    () => filters.find((f) => f.columnId === activeFilterId),
    [filters, activeFilterId]
  )

  const activeColumn = activeFilter
    ? table.getColumn(activeFilter.columnId)
    : null

  const selectedValues = new Set(
    activeColumn?.getFilterValue() as string[] | undefined
  )

  const facets = activeColumn?.getFacetedUniqueValues()

  // Calculate total active filters count for the badge
  const totalActiveFilters = filters.reduce((acc, filter) => {
    const column = table.getColumn(filter.columnId)
    const filterValue = column?.getFilterValue() as string[] | undefined
    return acc + (filterValue?.length ?? 0)
  }, 0)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='h-8 border-dashed'>
          <PlusCircledIcon className='mr-2 size-4' />
          Filter
          {totalActiveFilters > 0 && (
            <>
              <Separator orientation='vertical' className='mx-2 h-4' />
              <Badge
                variant='secondary'
                className='rounded-sm px-1 font-normal'
              >
                {totalActiveFilters}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[600px] p-0' align='start'>
        <div className='flex h-[300px]'>
          {/* Sidebar */}
          <div className='bg-muted/50 w-[200px] border-r p-2'>
            <div className='flex flex-col gap-1'>
              {filters.map((filter) => {
                const column = table.getColumn(filter.columnId)
                const filterValue = column?.getFilterValue() as
                  | string[]
                  | undefined
                const isActive = filterValue && filterValue.length > 0

                return (
                  <Button
                    key={filter.columnId}
                    variant={
                      activeFilterId === filter.columnId ? 'secondary' : 'ghost'
                    }
                    className={cn(
                      'justify-start font-normal',
                      activeFilterId === filter.columnId && 'bg-muted'
                    )}
                    onClick={() => setActiveFilterId(filter.columnId)}
                  >
                    {filter.title}
                    {isActive && (
                      <span className='bg-primary text-primary-foreground ml-auto flex h-4 w-4 items-center justify-center rounded-full text-[10px]'>
                        {filterValue.length}
                      </span>
                    )}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className='flex-1'>
            {activeFilter && activeColumn ? (
              <Command className='h-full border-none'>
                <CommandInput placeholder={`Search ${activeFilter.title}...`} />
                <CommandList className='h-full max-h-[unset]'>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {activeFilter.options.map((option) => {
                      const isSelected = selectedValues.has(option.value)
                      return (
                        <CommandItem
                          key={option.value}
                          onSelect={() => {
                            if (isSelected) {
                              selectedValues.delete(option.value)
                            } else {
                              selectedValues.add(option.value)
                            }
                            const filterValues = Array.from(selectedValues)
                            activeColumn.setFilterValue(
                              filterValues.length ? filterValues : undefined
                            )
                          }}
                        >
                          <div
                            className={cn(
                              'border-primary mr-2 flex size-4 items-center justify-center rounded-sm border',
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'opacity-50 [&_svg]:invisible'
                            )}
                          >
                            <CheckIcon className={cn('h-4 w-4')} />
                          </div>
                          {option.icon && (
                            <option.icon className='text-muted-foreground mr-2 size-4' />
                          )}
                          <span>{option.label}</span>
                          {facets?.get(option.value) && (
                            <span className='ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs'>
                              {facets.get(option.value)}
                            </span>
                          )}
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                  {selectedValues.size > 0 && (
                    <>
                      <CommandSeparator />
                      <CommandGroup>
                        <CommandItem
                          onSelect={() =>
                            activeColumn.setFilterValue(undefined)
                          }
                          className='justify-center text-center'
                        >
                          Clear {activeFilter.title} filter
                        </CommandItem>
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            ) : (
              <div className='text-muted-foreground flex h-full items-center justify-center'>
                Select a filter category
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
