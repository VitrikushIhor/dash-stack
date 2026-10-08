import { type Column } from '@tanstack/react-table'
import {
  FacetedFilter,
  type FacetedFilterProps,
} from '@/shared/ui/faceted-filter'

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
  options: FacetedFilterProps['options']
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const rawValue: unknown = column?.getFilterValue()
  const value = Array.isArray(rawValue)
    ? rawValue.filter(
        (item: unknown): item is string => typeof item === 'string'
      )
    : []
  const rawFacets = column?.getFacetedUniqueValues()
  const facets = new Map<string, number>()
  for (const option of options) {
    const count: unknown = rawFacets?.get(option.value)
    if (typeof count === 'number') facets.set(option.value, count)
  }
  return (
    <FacetedFilter
      title={title}
      options={options}
      value={value}
      facets={facets}
      onChange={(next) => column?.setFilterValue(next)}
    />
  )
}
