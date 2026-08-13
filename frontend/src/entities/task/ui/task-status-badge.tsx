import { Badge } from '@/shared/ui/core/badge'
import { STATUS_CONFIG } from '../model/task-status-config'
import { type TaskStatusEnum } from '../model/types'

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
