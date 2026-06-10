import { format, parseISO } from 'date-fns'
import { Calendar, Clock, Text, User } from 'lucide-react'
import { Button } from '@/shared/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/components/ui/dialog'
import { type Task } from '@/entities/task'
import { getTaskUser } from '@/features/event-calendar/lib/mappers'
import { useTaskModalStore } from '@/features/manage-task'

interface IProps {
  event: Task
  children: React.ReactNode
}

export function EventDetailsDialog({ event, children }: IProps) {
  const { openEdit } = useTaskModalStore()
  const startDate = parseISO(event.deadline)
  const endDate = parseISO(event.deadline)

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>{event.title}</DialogTitle>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='flex items-start gap-2'>
              <User className='mt-1 size-4 shrink-0' />
              <div>
                <p className='text-sm font-medium'>Responsible</p>
                <p className='text-muted-foreground text-sm'>
                  {getTaskUser(event).name}
                </p>
              </div>
            </div>

            <div className='flex items-start gap-2'>
              <Calendar className='mt-1 size-4 shrink-0' />
              <div>
                <p className='text-sm font-medium'>Start Date</p>
                <p className='text-muted-foreground text-sm'>
                  {format(startDate, 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>

            <div className='flex items-start gap-2'>
              <Clock className='mt-1 size-4 shrink-0' />
              <div>
                <p className='text-sm font-medium'>End Date</p>
                <p className='text-muted-foreground text-sm'>
                  {format(endDate, 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>

            <div className='flex items-start gap-2'>
              <Text className='mt-1 size-4 shrink-0' />
              <div>
                <p className='text-sm font-medium'>Description</p>
                <p className='text-muted-foreground text-sm'>
                  {event.description}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => openEdit(event)}
            >
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
