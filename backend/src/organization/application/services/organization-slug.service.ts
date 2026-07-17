import { Inject, Injectable } from '@nestjs/common';
import { OrganizationRepositoryPort } from '../ports/organization.port';
import { OrganizationSlug } from '../../domain/value-objects/organization-slug.vo';

@Injectable()
export class OrganizationSlugService {
  constructor(
    @Inject('OrganizationRepositoryPort')
    private readonly repositoryPort: OrganizationRepositoryPort,
  ) {}

  async generateUnique(name: string): Promise<string> {
    const baseSlug = OrganizationSlug.fromName(name);

    let candidate = baseSlug;
    let counter = 1;

    while (true) {
      const isExists = await this.repositoryPort.existsBySlug(candidate.value);
      if (!isExists) break;

      candidate = baseSlug.withSuffix(counter);
      counter++;
    }

    return candidate.value;
  }
}
