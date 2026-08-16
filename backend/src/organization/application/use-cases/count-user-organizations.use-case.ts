import { Inject, Injectable } from '@nestjs/common';
import { OrganizationRepositoryPort } from '../ports/organization.port';

@Injectable()
export class CountUserOrganizationsUseCase {
  constructor(
    @Inject('OrganizationRepositoryPort')
    private readonly organizationRepository: OrganizationRepositoryPort,
  ) {}

  async execute(userId: string): Promise<{ count: number }> {
    const count = await this.organizationRepository.countByUserId(userId);
    return { count };
  }
}
