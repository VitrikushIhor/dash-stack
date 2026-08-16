import { type Label } from '@/entities/label'
import { type Membership } from '@/entities/organization'
import { type TaskStatusEnum, STATUS_CONFIG } from '@/entities/task'

export function generateFilterOptions(
  members: Membership[],
  availableLabels: Label[]
) {
  const memberOptions = members.map((m) => {
    const name = m.user.firstName || m.user.email
    return { label: name, value: m.user.id }
  })

  return {
    status: Object.keys(STATUS_CONFIG).map((st) => ({
      label: STATUS_CONFIG[st as TaskStatusEnum].label,
      value: st,
      icon: STATUS_CONFIG[st as TaskStatusEnum].icon,
    })),
    labels: availableLabels.map((lbl) => ({
      label: lbl.name,
      value: lbl.name,
    })),
    members: memberOptions,
  }
}
