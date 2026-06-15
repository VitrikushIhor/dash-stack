import { useState, useCallback, memo } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/core/dialog'
import { Input } from '@/shared/ui/core/input'
import { Label as FormLabel } from '@/shared/ui/core/label'
import { ScrollArea } from '@/shared/ui/core/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/core/select'
import { LabelBadge } from './label-badge'
import { labelColorStyles, type Label, type LabelColor } from './types.label'

interface LabelManagerProps {
  labels: Label[]
  onCreateLabel: (name: string, color: LabelColor) => void
  onUpdateLabel: (id: string, name: string, color: LabelColor) => void
  onDeleteLabel: (id: string) => void
}

export const LabelManager = memo(function LabelManager({
  labels,
  onCreateLabel,
  onUpdateLabel,
  onDeleteLabel,
}: LabelManagerProps) {
  const [open, setOpen] = useState(false)
  const [editingLabel, setEditingLabel] = useState<Label | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState<LabelColor>('gray')

  const handleOpenCreate = useCallback(() => {
    setEditingLabel(null)
    setName('')
    setColor('gray')
    setOpen(true)
  }, [])

  const handleOpenEdit = useCallback((label: Label) => {
    setEditingLabel(label)
    setName(label.name)
    setColor(label.color)
    setOpen(true)
  }, [])

  const handleSave = useCallback(() => {
    const trimmedName = name.trim()
    if (!trimmedName) return

    if (editingLabel) {
      onUpdateLabel(editingLabel.id, trimmedName, color)
    } else {
      onCreateLabel(trimmedName, color)
    }

    setOpen(false)
    setName('')
    setColor('gray')
    setEditingLabel(null)
  }, [name, color, editingLabel, onCreateLabel, onUpdateLabel])

  const handleDelete = useCallback(
    (labelId: string) => {
      onDeleteLabel(labelId)
      if (editingLabel?.id === labelId) {
        setOpen(false)
        setEditingLabel(null)
      }
    },
    [editingLabel, onDeleteLabel]
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-sm font-medium'>Label management</h3>
          <DialogTrigger asChild>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handleOpenCreate}
              aria-label='Create new label'
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleOpenCreate()
              }}
            >
              <Plus className='mr-2 h-4 w-4' />
              New label
            </Button>
          </DialogTrigger>
        </div>

        <ScrollArea className='h-[300px]'>
          <div className='space-y-2'>
            {labels.length === 0 ? (
              <p className='text-muted-foreground py-8 text-center text-sm'>
                No labels
              </p>
            ) : (
              labels.map((label) => (
                <div
                  key={label.id}
                  className='hover:bg-accent group flex items-center justify-between rounded-lg border p-3 transition-colors'
                >
                  <LabelBadge label={label} size='md' />
                  <div className='flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8'
                      aria-label='Edit label'
                      tabIndex={0}
                      onClick={() => handleOpenEdit(label)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ')
                          handleOpenEdit(label)
                      }}
                    >
                      <Pencil className='h-4 w-4' />
                    </Button>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='text-destructive h-8 w-8'
                      aria-label='Delete label'
                      tabIndex={0}
                      onClick={() => handleDelete(label.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ')
                          handleDelete(label.id)
                      }}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{editingLabel ? 'Edit label' : 'New label'}</DialogTitle>
          <DialogDescription>
            {editingLabel
              ? 'Change the name or color of a label'
              : 'Create a new label for task organization'}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <FormLabel htmlFor='name'>Name</FormLabel>
            <Input
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Label name'
              maxLength={50}
              autoFocus
            />
          </div>

          <div className='space-y-2'>
            <FormLabel htmlFor='color'>Color</FormLabel>
            <Select
              value={color}
              onValueChange={(v) => setColor(v as LabelColor)}
            >
              <SelectTrigger id='color'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className='h-[200px]'>
                  {Object.entries(labelColorStyles).map(([colorKey, style]) => (
                    <SelectItem key={colorKey} value={colorKey}>
                      <div className='flex items-center gap-2'>
                        <div
                          className={`h-4 w-4 rounded-full border ${style.bg} ${style.border}`}
                        />
                        <span className='capitalize'>{colorKey}</span>
                      </div>
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>

          <div className='pt-2'>
            <p className='text-muted-foreground text-xs'>Preview:</p>
            <div className='mt-2'>
              <LabelBadge
                label={{ id: 'preview', name: name || 'Example', color }}
                size='md'
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {editingLabel ? 'Save' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
