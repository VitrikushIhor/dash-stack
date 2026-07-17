import { type Membership, type TeamPosition, OrgRole } from '@/shared/model'

export { OrgRole, type Membership, type TeamPosition }

export interface Organization {
  id: string
  name: string
  slug: string
  description?: string
  logo?: string
  memberships?: Membership[]
  currentUserRole?: OrgRole | null
  stats?: {
    projects: number
    members: number
    events: number
  }
  createdAt: string
  updatedAt: string
}

export type OrganizationSummary = Pick<
  Organization,
  'id' | 'name' | 'slug' | 'logo'
> &
  Partial<Pick<Organization, 'description' | 'stats'>>

export interface UserMembership {
  role: OrgRole
  organization: OrganizationSummary
}

export interface CreateOrganizationDto {
  name: string
  description?: string
}

export interface UpdateOrganizationDto {
  name?: string
  description?: string | null
  logo?: string | null
}
