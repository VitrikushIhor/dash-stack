'use client'

import { useCallback, useMemo } from 'react'
import { format } from 'date-fns'
import { DialogDescription } from '@radix-ui/react-dialog'
import { CalendarIcon, CheckCheck, Plus, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/shared/lib/utils'
import { type Membership } from '@/shared/model/types/membership'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  type FileUploadProps,
  FileUploadTrigger,
} from '@/shared/ui/components/file-upload'
import { LabelSelector } from '@/shared/ui/components/label/label-selector'
import { mockAvailableLabels } from '@/shared/ui/components/label/mock-labels'
import { Button } from '@/shared/ui/components/ui/button'
import { Calendar } from '@/shared/ui/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/components/ui/dialog'
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
import { ScrollArea } from '@/shared/ui/components/ui/scroll-area'
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
import { TaskStatusEnum, type Task } from '@/entities/task'
import { useGetOrganizations } from '@/features/organization'
import { TodoChecklist, useTaskForm } from '@/features/task'
import { TeamMemberPicker } from '@/features/team'
import { type TaskFormValues } from '../model/schema/create-task-schema'

interface AddTaskDialogProps {
  status?: TaskStatusEnum
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTaskDialog({
  task,
  open,
  onOpenChange,
}: AddTaskDialogProps) {
  const { data: organizations } = useGetOrganizations()
  const availableMembers = useMemo(() => {
    if (!organizations) return []
    const membersMap = new Map<string, Membership>()
    organizations.forEach((org) => {
      org.memberships?.forEach((m) => {
        membersMap.set(m.userId, m)
      })
    })
    return Array.from(membersMap.values())
  }, [organizations])

  const {
    checklists,
    addChecklist,
    form,
    selectedLabels,
    selectedMembers,
    setSelectedLabels,
    setSelectedMembers,
    handleSubmit,
    setFiles,
    files,
  } = useTaskForm(task)

  const onUpload: NonNullable<FileUploadProps['onUpload']> = useCallback(
    async (files, { onProgress, onSuccess, onError }) => {
      try {
        const uploadPromises = files.map(async (file) => {
          try {
            const totalChunks = 10
            let uploadedChunks = 0
            for (let i = 0; i < totalChunks; i++) {
              await new Promise((resolve) =>
                setTimeout(resolve, Math.random() * 200 + 100)
              )
              uploadedChunks++
              const progress = (uploadedChunks / totalChunks) * 100
              onProgress(file, progress)
            }
            await new Promise((resolve) => setTimeout(resolve, 500))
            onSuccess(file)
          } catch (error) {
            onError(
              file,
              error instanceof Error ? error : new Error('Upload failed')
            )
          }
        })
        await Promise.all(uploadPromises)
      } catch (_error) {
        // This handles any error that might occur outside the individual upload processes
        // You should handle this gracefully in production
      }
    },
    []
  )

  const onFileReject = useCallback((file: File, message: string) => {
    toast.error(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    })
  }, [])

  const onSubmit = async (values: TaskFormValues) => {
    const res = await handleSubmit(values)
    if (res?.success) {
      onOpenChange(false)
      toast.success('Task updated successfully')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Edit Task </DialogTitle>
          <DialogDescription>You are editing: {task.title}</DialogDescription>
        </DialogHeader>

        <ScrollArea className='h-[calc(90vh-120px)] pr-4'>
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
                        defaultValue={task.status ?? undefined}
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
              <div className='space-y-2'>
                <TeamMemberPicker
                  selectedMembers={selectedMembers}
                  availableMembers={availableMembers}
                  onMembersChange={setSelectedMembers}
                  maxMembers={3}
                  label='Assigned Members'
                />
              </div>

              <Separator />

              <LabelSelector
                selectedLabels={selectedLabels}
                availableLabels={mockAvailableLabels}
                onLabelsChange={setSelectedLabels}
                onCreateLabel={() => {}}
                maxLabels={2}
              />

              <Separator />

              {/* Checklists */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <label className='text-sm font-medium'>Checklists</label>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    onClick={addChecklist}
                  >
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>
                {checklists.length === 0 && (
                  <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                    <CheckCheck className='h-4 w-4' />
                    <span>No Checklists</span>
                  </div>
                )}
                {checklists.map((checklist) => (
                  <TodoChecklist
                    key={checklist.id}
                    checklistId={checklist.id}
                  />
                ))}
              </div>
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

              <div className='flex flex-col space-y-4'>
                <label className='text-sm font-medium'>Attachment</label>

                <FileUpload
                  value={files}
                  onValueChange={setFiles}
                  onUpload={onUpload}
                  onFileReject={onFileReject}
                  maxFiles={2}
                  className='w-full max-w-md'
                  multiple
                >
                  <FileUploadDropzone>
                    <div className='flex flex-col items-center gap-1 text-center'>
                      <div className='flex items-center justify-center rounded-full border p-2.5'>
                        <Upload className='text-muted-foreground size-6' />
                      </div>
                      <p className='text-sm font-medium'>
                        Drag & drop files here
                      </p>
                      <p className='text-muted-foreground text-xs'>
                        Or click to browse (max 2 files)
                      </p>
                    </div>
                    <FileUploadTrigger asChild>
                      <Button
                        variant='outline'
                        size='sm'
                        className='mt-2 w-fit'
                      >
                        Browse files
                      </Button>
                    </FileUploadTrigger>
                  </FileUploadDropzone>
                  <FileUploadList>
                    {files.map((file, index) => (
                      <FileUploadItem
                        key={index}
                        value={file}
                        className='flex-col'
                      >
                        <div className='flex w-full items-center gap-2'>
                          <FileUploadItemPreview />
                          <FileUploadItemMetadata />
                          <FileUploadItemDelete asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='size-7'
                            >
                              <X />
                            </Button>
                          </FileUploadItemDelete>
                        </div>
                        <FileUploadItemProgress />
                      </FileUploadItem>
                    ))}
                  </FileUploadList>
                </FileUpload>
              </div>
              {/* Action Buttons */}
              <div className='flex justify-end gap-2 pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type='submit'>Edit</Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
