'use client'

import { useEffect } from 'react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/core/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/core/form'
import { Input } from '@/shared/ui/core/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/core/select'
import type { LabelDto } from '@/entities/label'
import { labelColorNames, labelColorStyles } from '@/entities/label/model/types'
import { useLabelForm } from '../model/use-label-form'

interface LabelFormProps {
  initialData?: LabelDto | null
  onSuccess?: () => void
  submitLabel?: string
  className?: string
}

export const LabelForm = ({
  initialData,
  onSuccess,
  submitLabel = 'Save',
  className = '',
}: LabelFormProps) => {
  const { form, onSubmit, isPending } = useLabelForm({ initialData, onSuccess })

  useEffect(() => {
    if (initialData) {
      form.reset({ name: initialData.name, color: initialData.color })
    } else {
      form.reset({ name: '', color: 'gray' })
    }
  }, [initialData, form])

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className={`space-y-4 ${className}`}>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder='e.g. Bug, Feature' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='color'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a color' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {labelColorNames.map((color) => (
                    <SelectItem key={color} value={color}>
                      <div className='flex items-center gap-2'>
                        <div
                          className={cn(
                            'h-3 w-3 rounded-full border',
                            labelColorStyles[color].bg,
                            labelColorStyles[color].border
                          )}
                        />
                        <span className='capitalize'>{color}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex justify-end pt-2'>
          <Button
            type='submit'
            disabled={isPending || !form.formState.isDirty}
            className='w-full sm:w-auto'
          >
            {isPending ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
