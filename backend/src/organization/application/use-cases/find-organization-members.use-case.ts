import { Inject, Injectable } from '@nestjs/common';
import {
  OrganizationMember,
  OrganizationRepositoryPort,
} from '../ports/organization.port';

@Injectable()
export class FindOrganizationMembersUseCase {
  constructor(
    @Inject('OrganizationRepositoryPort')
    private readonly organizationRepository: OrganizationRepositoryPort,
  ) {}

  async execute(orgId: string): Promise<OrganizationMember[]> {
    return this.organizationRepository.findOrganizationMembers(orgId);
  }
}
