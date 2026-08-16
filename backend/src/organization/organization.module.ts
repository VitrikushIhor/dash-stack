import { Module } from '@nestjs/common';
import { OrganizationController } from './presentation/organization.controller';
import { CreateOrganizationUseCase } from './application/use-cases/create-organization.use-case';
import { FindOrganizationsByUserIdUseCase } from './application/use-cases/find-organizations-by-user-id.use-case';
import { FindOrganizationByIdUseCase } from './application/use-cases/find-organization-by-id.use-case';
import { UpdateOrganizationUseCase } from './application/use-cases/update-organization.use-case';
import { DeleteOrganizationUseCase } from './application/use-cases/delete-organization.use-case';
import { FindOrganizationMembersUseCase } from './application/use-cases/find-organization-members.use-case';
import { FindOrganizationMemberUseCase } from './application/use-cases/find-organization-member.use-case';
import { PrismaOrganizationRepository } from './infrastructure/persistence/prisma-organization.repository';
import { OrganizationSlugService } from './application/services/organization-slug.service';

import { FindUserMembershipsUseCase } from './application/use-cases/find-user-memberships.use-case';
import { CountUserOrganizationsUseCase } from './application/use-cases/count-user-organizations.use-case';

@Module({
  controllers: [OrganizationController],
  providers: [
    {
      provide: 'OrganizationRepositoryPort',
      useClass: PrismaOrganizationRepository,
    },
    OrganizationSlugService,
    CreateOrganizationUseCase,
    FindOrganizationsByUserIdUseCase,
    FindOrganizationByIdUseCase,
    UpdateOrganizationUseCase,
    DeleteOrganizationUseCase,
    FindOrganizationMembersUseCase,
    FindOrganizationMemberUseCase,
    FindUserMembershipsUseCase,
    CountUserOrganizationsUseCase,
  ],
  exports: [
    'OrganizationRepositoryPort',
    FindUserMembershipsUseCase,
    CountUserOrganizationsUseCase,
  ],
})
export class OrganizationModule {}
