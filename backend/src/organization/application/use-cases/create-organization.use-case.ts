import { Inject, Injectable } from '@nestjs/common';
import { OrganizationRepositoryPort } from '../ports/organization.port';
import { OrganizationSlugService } from '../services/organization-slug.service';
import { CreateOrganizationCommand } from '../commands/create-organization.command';
import { OrganizationReadModel } from '../read-models/organization.read-model';

@Injectable()
export class CreateOrganizationUseCase {
  constructor(
    @Inject('OrganizationRepositoryPort')
    private readonly organizationRepository: OrganizationRepositoryPort,
    @Inject(OrganizationSlugService)
    private readonly slugService: OrganizationSlugService,
  ) {}

  async execute(
    userId: string,
    command: CreateOrganizationCommand,
  ): Promise<OrganizationReadModel> {
    const uniqueSlug = await this.slugService.generateUnique(command.name);

    return this.organizationRepository.create(userId, uniqueSlug, {
      name: command.name,
      description: command.description ?? null,
      logo: command.logo ?? null,
    });
  }
}
