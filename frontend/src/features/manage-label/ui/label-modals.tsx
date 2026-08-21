'use client'

import type { LabelDto } from '@/entities/label'
import { DeleteLabelDialog } from './delete-label-dialog'
import { LabelFormDialog } from './label-form-dialog'

interface LabelModalsProps {
  slug: string
  labels: LabelDto[]
}

export function LabelModals({ slug, labels }: LabelModalsProps) {
  return (
    <>
      <LabelFormDialog slug={slug} labels={labels} />
      <DeleteLabelDialog slug={slug} labels={labels} />
    </>
  )
}
