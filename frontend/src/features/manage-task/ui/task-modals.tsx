'use client'

import dynamic from 'next/dynamic'
import { type Label } from '@/entities/label'
import { type Membership } from '@/entities/organization'

const ManageTaskModal = dynamic(
  () => import('./manage-task-modal').then((mod) => mod.ManageTaskModal),
  { ssr: false }
)

const DeleteTaskModal = dynamic(
  () => import('./delete-task-modal').then((mod) => mod.DeleteTaskModal),
  { ssr: false }
)

export function TaskModals({
  slug,
  labels,
  members,
}: {
  slug: string
  labels: Label[]
  members: Membership[]
}) {
  return (
    <>
      <ManageTaskModal slug={slug} labels={labels} members={members} />
      <DeleteTaskModal slug={slug} />
    </>
  )
}
