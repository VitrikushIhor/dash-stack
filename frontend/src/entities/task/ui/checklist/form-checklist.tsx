import { useFormContext } from 'react-hook-form'
import { Plus, CheckCheck } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/shared/ui/core/form'
import { type Checklist } from '@/entities/task'
import { ChecklistWidget } from './checklist-widget'

interface FormChecklistProps {
  name: string
  label?: string
}

export function FormChecklist({
  name,
  label = 'Checklists',
}: FormChecklistProps) {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const checklists: Checklist[] = field.value || []

        const handleAddChecklist = () => {
          const newChecklist: Checklist = {
            id: crypto.randomUUID(),
            name: `Checklist ${checklists.length + 1}`,
            items: [],
          }
          field.onChange([...checklists, newChecklist])
        }

        const handleChecklistChange = (updatedChecklist: Checklist) => {
          const newChecklists = checklists.map((c) =>
            c.id === updatedChecklist.id ? updatedChecklist : c
          )
          field.onChange(newChecklists)
        }

        const handleChecklistDelete = (checklistId: string) => {
          const newChecklists = checklists.filter((c) => c.id !== checklistId)
          field.onChange(newChecklists)
        }

        return (
          <FormItem>
            <div className='flex items-center justify-between'>
              <label className='text-sm font-medium'>{label}</label>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={handleAddChecklist}
              >
                <Plus className='h-4 w-4' />
              </Button>
            </div>

            <FormControl>
              <div className='space-y-2'>
                {checklists.length === 0 && (
                  <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                    <CheckCheck className='h-4 w-4' />
                    <span>No Checklists</span>
                  </div>
                )}
                {checklists.map((checklist) => (
                  <ChecklistWidget
                    key={checklist.id}
                    checklist={checklist}
                    onChange={handleChecklistChange}
                    onDelete={handleChecklistDelete}
                  />
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
