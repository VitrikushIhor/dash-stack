import { Inject, Injectable } from '@nestjs/common';
import { OrganizationRepositoryPort } from '../ports/organization.port';
import { OrganizationReadModel } from '../read-models/organization.read-model';

@Injectable()
export class FindOrganizationByIdUseCase {
  constructor(
    @Inject('OrganizationRepositoryPort')
    private readonly organizationRepository: OrganizationRepositoryPort,
  ) {}

  async execute(orgId: string): Promise<OrganizationReadModel | null> {
    return this.organizationRepository.findById(orgId);
  }
}
