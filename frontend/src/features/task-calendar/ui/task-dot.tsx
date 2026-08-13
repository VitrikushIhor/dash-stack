import { cn } from '@/shared/lib/utils'

interface IProps {
  className?: string
}

export function TaskDot({ className }: IProps) {
  return (
    <svg
      width='8'
      height='8'
      viewBox='0 0 8 8'
      className={cn('task-dot shrink-0', className)}
    >
      <circle cx='4' cy='4' r='4' />
    </svg>
  )
}
