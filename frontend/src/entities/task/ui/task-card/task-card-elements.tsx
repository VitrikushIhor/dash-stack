import { Calendar, ListTodo, Paperclip } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export const TaskDate = ({
  date,
  overdue,
}: {
  date?: string
  overdue: boolean
}) => {
  if (!date) return <div />
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-xs',
        overdue ? 'font-medium text-red-600' : 'text-muted-foreground'
      )}
    >
      <Calendar className='h-4 w-4' />
      <span>{date}</span>
    </div>
  )
}

export const TaskProgress = ({
  completed,
  total,
}: {
  completed: number
  total: number
}) => {
  if (total === 0) return null
  return (
    <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
      <ListTodo className='h-4 w-4' />
      <span className={cn(completed === total && 'font-medium text-green-600')}>
        {completed}/{total}
      </span>
    </div>
  )
}

export const TaskAttachments = ({ count }: { count: number }) => {
  if (count === 0) return null
  return (
    <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
      <Paperclip className='h-3 w-3' />
      <span>{count}</span>
    </div>
  )
}
