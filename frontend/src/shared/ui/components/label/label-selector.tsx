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
  selectedLabel: Label | null
  availableLabels: Label[]
  onLabelChange: (label: Label | null) => void
  onCreateLabel?: (name: string, color: string) => void
  className?: string
}

export const LabelSelector = memo(function LabelSelector({
  selectedLabel,
  availableLabels,
  onLabelChange,
  onCreateLabel,
  className,
}: LabelSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredLabels = useMemo(() => {
    return availableLabels.filter((label) =>
      label.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [availableLabels, searchQuery])

  const handleToggleLabel = useCallback(
    (label: Label) => {
      if (selectedLabel?.id !== label.id) {
        onLabelChange(label)
      }
      setOpen(false) // Close popover after selection
    },
    [selectedLabel, onLabelChange]
  )

  return (
    <div className={cn('space-y-2', className)}>
      <div className='flex items-center justify-between'>
        <label className='text-sm font-medium'>Label</label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
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
                      const isSelected = selectedLabel?.id === label.id
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

      {!selectedLabel ? (
        <div className='text-muted-foreground flex items-center gap-2 text-sm'>
          <Tag className='h-4 w-4' />
          <span>No label</span>
        </div>
      ) : (
        <div className='flex flex-wrap gap-1.5'>
          <LabelBadge label={selectedLabel} size='sm' />
        </div>
      )}
    </div>
  )
})
