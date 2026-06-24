import { Inject, Injectable } from '@nestjs/common';
import { OrganizationRepositoryPort } from '../ports/organization.port';
import { OrganizationReadModel } from '../read-models/organization.read-model';
import { UpdateOrganizationCommand } from '../commands/update-organization.command';
import { OrganizationNotFoundException } from '../../domain/exceptions/organization-not-found.exception';

@Injectable()
export class UpdateOrganizationUseCase {
  constructor(
    @Inject('OrganizationRepositoryPort')
    private readonly organizationRepository: OrganizationRepositoryPort,
  ) {}

  async execute(
    orgId: string,
    command: UpdateOrganizationCommand,
  ): Promise<OrganizationReadModel> {
    const updatedOrg = await this.organizationRepository.update(orgId, {
      name: command.name,
      description: command.description,
      logo: command.logo,
    });

    if (!updatedOrg) {
      throw new OrganizationNotFoundException(orgId);
    }

    return updatedOrg;
  }
}
