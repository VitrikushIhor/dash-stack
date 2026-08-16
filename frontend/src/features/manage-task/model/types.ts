export const ManageTaskMode = {
  CREATE: 'CREATE',
  EDIT: 'EDIT',
} as const

export type ManageTaskMode =
  (typeof ManageTaskMode)[keyof typeof ManageTaskMode]
