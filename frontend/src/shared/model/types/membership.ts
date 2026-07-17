import { type OrgRole } from './org-role'

export type TeamPosition =
  | 'PRODUCT_MANAGER'
  | 'LEAD_DEVELOPER'
  | 'FRONTEND_DEVELOPER'
  | 'BACKEND_DEVELOPER'
  | 'UI_UX_DESIGNER'
  | 'QA_ENGINEER'
  | 'DEVOPS_ENGINEER'

export interface Membership {
  id: string
  userId: string
  orgId: string
  role: OrgRole
  position?: TeamPosition
  joinedAt: string
  user: {
    id: string
    email: string
    firstName?: string
    avatar?: string
  }
}
