export interface OrganizationReadModel {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
  stats?: {
    members: number;
    projects: number;
    events: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
