'use client'

import type { LabelDto } from '@/entities/label'
import { DeleteLabelDialog } from './delete-label-dialog'
import { LabelFormDialog } from './label-form-dialog'

interface LabelModalsProps {
  labels: LabelDto[]
}

export function LabelModals({ labels }: LabelModalsProps) {
  return (
    <>
      <LabelFormDialog labels={labels} />
      <DeleteLabelDialog labels={labels} />
    </>
  )
}
