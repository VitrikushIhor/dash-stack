import {
  type Membership,
  type TeamPosition,
} from '@/shared/model/types/membership'
import { OrgRole } from '@/shared/model/types/org-role'

export { OrgRole, type Membership, type TeamPosition }

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
