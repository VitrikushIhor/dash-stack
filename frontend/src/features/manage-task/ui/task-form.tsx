import { type UseFormReturn } from 'react-hook-form'
import { type Membership } from '@/shared/model/types/membership'
import { mockAvailableLabels } from '@/shared/ui'
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/core/select'
import { Separator } from '@/shared/ui/core/separator'
import { Textarea } from '@/shared/ui/core/textarea'
import { FormFileUpload } from '@/shared/ui/form-fields/form-file-upload'
import { FormLabelSelector } from '@/shared/ui/form-fields/form-label-selector'
import { TaskStatusEnum, type TaskFormValues } from '@/entities/task'
import { FormChecklist } from '@/features/checklist'
import { FormMemberPicker } from '@/features/team'
import { TaskDatePickerField } from './task-date-picker-field'

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

        <div className='grid grid-cols-2 gap-4'>
          <TaskDatePickerField
            form={form}
            name='startDate'
            label='Start Date'
            placeholder='Pick start date'
            disabled={(date) =>
              date < new Date(new Date().setHours(0, 0, 0, 0))
            }
          />
          <TaskDatePickerField
            form={form}
            name='dueDate'
            label='Due Date'
            placeholder='Pick due date'
            disabled={(date) =>
              date < new Date(new Date().setHours(0, 0, 0, 0))
            }
          />
        </div>

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
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            disabled={form.formState.isSubmitting}
          >
            Cancel
          </Button>
          <Button type='submit' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : submitText}
          </Button>
        </div>
      </form>
    </Form>
  )
}
