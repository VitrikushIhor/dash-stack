import { OrganizationReadModel } from '../read-models/organization.read-model';

export interface CreateOrganizationData {
  name: string;
  description: string | null;
  logo: string | null;
}

export interface OrganizationMember {
  user: {
    id: string;
    email: string;
    firstName: string;
    avatar: string;
  };
}

export interface OrganizationDetailsRecord {
  id: string;
  name: string;
  description: string | null;
  logo?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationRepositoryPort {
  create(
    userId: string,
    uniqueSlug: string,
    data: CreateOrganizationData,
  ): Promise<OrganizationReadModel>;
  findManyByUserId(userId: string): Promise<OrganizationReadModel[]>;
  findById(id: string): Promise<OrganizationReadModel | null>;
  update(
    orgId: string,
    data: Partial<CreateOrganizationData>,
  ): Promise<OrganizationReadModel | null>;
  delete(orgId: string): Promise<void>;
  findOrganizationMembers(orgId: string): Promise<OrganizationMember[]>;
  findOrganizationMember(
    orgId: string,
    userId: string,
  ): Promise<OrganizationMember | null>;
  existsBySlug(slug: string): Promise<boolean>;
}
