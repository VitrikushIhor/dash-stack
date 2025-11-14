import { useState, useCallback, useMemo, memo } from 'react'
import { Plus, Check, Tag } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
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
import { ScrollArea } from '@/shared/ui/components/ui/scroll-area'
import { LabelBadge } from './label-badge'
import { labelColorStyles, type Label } from './types.label'

interface LabelSelectorProps {
  selectedLabels: Label[]
  availableLabels: Label[]
  onLabelsChange: (labels: Label[]) => void
  onCreateLabel?: (name: string, color: string) => void
  maxLabels?: number
  className?: string
}

export const LabelSelector = memo(function LabelSelector({
  selectedLabels,
  availableLabels,
  onLabelsChange,
  onCreateLabel,
  maxLabels,
  className,
}: LabelSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const selectedIds = useMemo(
    () => new Set(selectedLabels.map((l) => l.id)),
    [selectedLabels]
  )

  const filteredLabels = useMemo(() => {
    return availableLabels.filter(
      (label) =>
        !selectedIds.has(label.id) &&
        label.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [availableLabels, selectedIds, searchQuery])

  const canAddMore = useMemo(() => {
    if (!maxLabels) return true
    return selectedLabels.length < maxLabels
  }, [selectedLabels.length, maxLabels])

  const handleToggleLabel = useCallback(
    (label: Label) => {
      if (selectedIds.has(label.id)) {
        onLabelsChange(selectedLabels.filter((l) => l.id !== label.id))
      } else if (canAddMore) {
        onLabelsChange([...selectedLabels, label])
      }
    },
    [selectedLabels, selectedIds, onLabelsChange, canAddMore]
  )

  const handleRemoveLabel = useCallback(
    (labelId: string) => {
      onLabelsChange(selectedLabels.filter((l) => l.id !== labelId))
    },
    [selectedLabels, onLabelsChange]
  )

  return (
    <div className={cn('space-y-2', className)}>
      <div className='flex items-center justify-between'>
        <label className='text-sm font-medium'>Labels</label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              disabled={!canAddMore}
            >
              <Plus className='h-4 w-4' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-72 p-0' align='start'>
            <Command>
              <CommandInput
                placeholder='Search labels...'
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>
                  <div className='text-muted-foreground py-6 text-center text-sm'>
                    No labels found
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  <ScrollArea className='h-[240px]'>
                    {filteredLabels.map((label) => {
                      const isSelected = selectedIds.has(label.id)
                      const colorStyle = labelColorStyles[label.color]

                      return (
                        <CommandItem
                          key={label.id}
                          onSelect={() => handleToggleLabel(label)}
                          className='cursor-pointer'
                        >
                          <div className='flex flex-1 items-center gap-2'>
                            <div
                              className={cn(
                                'flex h-5 w-5 items-center justify-center rounded border',
                                isSelected
                                  ? 'bg-primary border-primary'
                                  : 'border-input'
                              )}
                            >
                              {isSelected && (
                                <Check className='h-3 w-3 text-white' />
                              )}
                            </div>
                            <span
                              className={cn(
                                'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
                                colorStyle.bg,
                                colorStyle.text,
                                colorStyle.border
                              )}
                            >
                              {label.name}
                            </span>
                          </div>
                        </CommandItem>
                      )
                    })}
                  </ScrollArea>
                </CommandGroup>

                {onCreateLabel &&
                  searchQuery &&
                  filteredLabels.length === 0 && (
                    <>
                      <CommandSeparator />
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => {
                            onCreateLabel(searchQuery, 'gray')
                            setSearchQuery('')
                          }}
                          className='cursor-pointer'
                        >
                          <Plus className='mr-2 h-4 w-4' />
                          Create "{searchQuery}"
                        </CommandItem>
                      </CommandGroup>
                    </>
                  )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {selectedLabels.length === 0 ? (
        <div className='text-muted-foreground flex items-center gap-2 text-sm'>
          <Tag className='h-4 w-4' />
          <span>No labels</span>
        </div>
      ) : (
        <div className='flex flex-wrap gap-1.5'>
          {selectedLabels.map((label) => (
            <LabelBadge
              key={label.id}
              label={label}
              onRemove={handleRemoveLabel}
              size='sm'
            />
          ))}
        </div>
      )}
    </div>
  )
})
