import { format } from 'date-fns'
import { type UseFormReturn } from 'react-hook-form'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { type Membership } from '@/shared/model/types/membership'
import { mockAvailableLabels } from '@/shared/ui/components/label/mock-labels'
import { Button } from '@/shared/ui/components/ui/button'
import { Calendar } from '@/shared/ui/components/ui/calendar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/components/ui/form'
import { Input } from '@/shared/ui/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/ui/select'
import { Separator } from '@/shared/ui/components/ui/separator'
import { Textarea } from '@/shared/ui/components/ui/textarea'
import { FormFileUpload } from '@/shared/ui/form-fields/form-file-upload'
import { FormLabelSelector } from '@/shared/ui/form-fields/form-label-selector'
import { TaskStatusEnum, type TaskFormValues } from '@/entities/task'
import { FormChecklist } from '@/features/checklist'
import { FormMemberPicker } from '@/features/team'

type TaskFormProps = {
  onSubmit: (values: TaskFormValues) => void
  onCancel: () => void
  form: UseFormReturn<TaskFormValues>
  allMembers: Membership[]
  onFileReject: (file: File, message: string) => void
  onUpload: (
    files: File[],
    options: {
      onProgress: (file: File, progress: number) => void
      onSuccess: (file: File) => void
      onError: (file: File, error: Error) => void
    }
  ) => void | Promise<void>
  submitText?: string
}

export function TaskForm({
  onSubmit,
  onCancel,
  form,
  onFileReject,
  onUpload,
  allMembers,
  submitText = 'Create',
}: TaskFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
        {/* Main Information */}
        <FormField
          control={form.control}
          name={'title'}
          render={({ field }) => (
            <FormItem className='flex flex-col space-y-2'>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder='Provide task title' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Separator />

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem className='flex flex-col space-y-2'>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Provide task description'
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <FormField
          control={form.control}
          name='status'
          render={({ field }) => (
            <FormItem className='flex flex-col space-y-2'>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Select
                  value={field.value ?? undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Provide task status for task' />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Status</SelectLabel>
                      {Object.values(TaskStatusEnum).map((value) => (
                        <SelectItem key={value} value={value}>
                          {value.toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        {/* Members */}
        <FormMemberPicker
          name='assignees'
          availableMembers={allMembers}
          maxMembers={3}
          label='Assigned Members'
        />

        <Separator />

        <FormLabelSelector
          name='label'
          availableLabels={mockAvailableLabels}
          onCreateLabel={(name, color) => {
            form.setValue('label', {
              id: crypto.randomUUID(),
              name,
              color,
            })
          }}
        />

        <Separator />

        {/* Checklists */}
        <FormChecklist name='checklists' />

        <Separator />

        <FormField
          control={form.control}
          name={'deadline'}
          render={({ field }) => (
            <FormItem className={cn('flex flex-col space-y-2')}>
              <FormLabel>Deadline</FormLabel>
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
                      {field.value ? (
                        format(field.value, 'dd MMM yyyy')
                      ) : (
                        <span>Deadline</span>
                      )}
                      <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Separator />

        <FormFileUpload
          name='files'
          label='Attachment'
          onUpload={onUpload}
          onFileReject={onFileReject}
          maxFiles={2}
          className='w-full max-w-md'
          multiple
        />

        {/* Action Buttons */}
        <div className='flex justify-end gap-2 pt-4'>
          <Button type='button' variant='outline' onClick={onCancel}>
            Cancel
          </Button>
          <Button type='submit'>{submitText}</Button>
        </div>
      </form>
    </Form>
  )
}
