import { Badge } from '@/shared/ui/components/ui/badge'
import { type TaskStatusEnum, STATUS_CONFIG } from '@/entities/task'

export function TaskStatusBadge({ status }: { status: TaskStatusEnum }) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className='mr-1.5 h-5 w-5' />
      <span className='text-md truncate font-medium'>{config.label}</span>
    </Badge>
  )
}
