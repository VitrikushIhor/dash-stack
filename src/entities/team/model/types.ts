export enum USER_GENDER {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}

export enum TEAM_ROLES {
  Admin = 'Admin',
  Product_Manager = 'Product Manager',
  Lead_Developer = 'Lead Developer',
  Frontend_Developer = 'Frontend Developer',
  Backend_Developer = 'Backend Developer',
  UI_UX_Designer = 'UI/UX Designer',
  QA_Engineer = 'QA Engineer',
  DevOps_Engineer = 'DevOps Engineer',
}
export interface TeamMember {
  id: string
  avatar: string
  first_name: string
  last_name: string
  email: string
  gender: USER_GENDER
  position: TEAM_ROLES
}
