export enum OrgRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  GUEST = 'GUEST',
}

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

export interface Organization {
  id: string
  name: string
  slug: string
  description?: string
  logo?: string
  memberships?: Membership[]
  stats?: {
    projects: number
    members: number
    events: number
  }
  createdAt: string
  updatedAt: string
}

export interface CreateOrganizationDto {
  name: string
  description?: string
}

export interface UpdateOrganizationDto {
  name?: string
  description?: string
  logo?: string
}
