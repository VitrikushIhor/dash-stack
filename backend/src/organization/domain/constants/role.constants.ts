import { OrgRole } from '../enums/org-role.enum';

export const ORG_ROLES_KEY = 'orgRoles';

export const ROLE_HIERARCHY: Record<OrgRole, number> = {
  [OrgRole.OWNER]: 4,
  [OrgRole.ADMIN]: 3,
  [OrgRole.MEMBER]: 2,
  [OrgRole.GUEST]: 1,
};
