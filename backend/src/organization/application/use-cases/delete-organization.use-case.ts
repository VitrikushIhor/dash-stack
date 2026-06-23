import { Inject, Injectable } from '@nestjs/common';
import { OrganizationRepositoryPort } from '../ports/organization.port';

@Injectable()
export class DeleteOrganizationUseCase {
  constructor(
    @Inject('OrganizationRepositoryPort')
    private readonly organizationRepository: OrganizationRepositoryPort,
  ) {}

  async execute(orgId: string): Promise<{ message: string }> {
    await this.organizationRepository.delete(orgId);

    return { message: 'Organization deleted successfully' };
  }
}
