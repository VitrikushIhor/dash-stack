import { Inject, Injectable } from '@nestjs/common';
import { OrganizationRepositoryPort } from '../ports/organization.port';
import { TenantContextReadModel } from '../read-models/tenant-context.read-model';
import { OrganizationNotFoundBySlugException } from '../../domain/exceptions/organization-not-found-by-slug.exception';

@Injectable()
export class ResolveTenantContextUseCase {
  constructor(
    @Inject('OrganizationRepositoryPort')
    private readonly organizationRepository: OrganizationRepositoryPort,
  ) {}

  async execute(slug: string, userId: string): Promise<TenantContextReadModel> {
    const tenantContext = await this.organizationRepository.findMembershipBySlugAndUserId(
      slug,
      userId,
    );

    if (!tenantContext) {
      throw new OrganizationNotFoundBySlugException(slug);
    }

    return tenantContext;
  }
}
