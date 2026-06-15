import { format, isDate } from 'date-fns'
import {
  type UseFormReturn,
  type Path,
  type FieldValues,
} from 'react-hook-form'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/core/button'
import { Calendar } from '@/shared/ui/core/calendar'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/core/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/core/popover'

interface TaskDatePickerFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>
  name: Path<T>
  label: string
  placeholder: string
  disabled?: (date: Date) => boolean
}

export function TaskDatePickerField<T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  disabled,
}: TaskDatePickerFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('flex flex-col space-y-2')}>
          <FormLabel>{label}</FormLabel>
          <div className='flex gap-1'>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant='outline'
                    className={cn(
                      'w-full pl-3 text-left font-normal',
                      !field.value && 'text-muted-foreground'
                    )}
                  >
                    {isDate(field.value) ? (
                      format(field.value, 'dd MMM yyyy')
                    ) : (
                      <span>{placeholder}</span>
                    )}
                    <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  mode='single'
                  selected={field.value ?? undefined}
                  onSelect={(date) => field.onChange(date ?? null)}
                  disabled={disabled}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
