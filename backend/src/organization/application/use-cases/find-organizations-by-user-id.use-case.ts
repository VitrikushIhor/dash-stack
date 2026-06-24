import { Inject, Injectable } from '@nestjs/common';
import { OrganizationRepositoryPort } from '../ports/organization.port';
import { OrganizationReadModel } from '../read-models/organization.read-model';

@Injectable()
export class FindOrganizationsByUserIdUseCase {
  constructor(
    @Inject('OrganizationRepositoryPort')
    private readonly organizationRepository: OrganizationRepositoryPort,
  ) {}

  async execute(userId: string): Promise<OrganizationReadModel[]> {
    return this.organizationRepository.findManyByUserId(userId);
  }
}
