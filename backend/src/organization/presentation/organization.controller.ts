import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { OrgRole } from '../domain/enums/org-role.enum';
import { UserEntity } from '../../common/decorators/user.decorator';
import { TenantId } from './decorators/tenant.decorator';
import { RequireTenantRole } from './decorators/require-tenant-role.decorator';
import { CreateOrganizationUseCase } from '../application/use-cases/create-organization.use-case';
import { UpdateOrganizationUseCase } from '../application/use-cases/update-organization.use-case';
import { DeleteOrganizationUseCase } from '../application/use-cases/delete-organization.use-case';
import { FindOrganizationMembersUseCase } from '../application/use-cases/find-organization-members.use-case';
import { FindOrganizationMemberUseCase } from '../application/use-cases/find-organization-member.use-case';
import { FindOrganizationsByUserIdUseCase } from '../application/use-cases/find-organizations-by-user-id.use-case';
import { FindOrganizationByIdUseCase } from '../application/use-cases/find-organization-by-id.use-case';
import { CreateOrganizationCommand } from '../application/commands/create-organization.command';
import { UpdateOrganizationCommand } from '../application/commands/update-organization.command';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationController {
  constructor(
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
    private readonly findOrganizationsByUserIdUseCase: FindOrganizationsByUserIdUseCase,
    private readonly findOrganizationByIdUseCase: FindOrganizationByIdUseCase,
    private readonly updateOrganizationUseCase: UpdateOrganizationUseCase,
    private readonly deleteOrganizationUseCase: DeleteOrganizationUseCase,
    private readonly findOrganizationMembersUseCase: FindOrganizationMembersUseCase,
    private readonly findOrganizationMemberUseCase: FindOrganizationMemberUseCase,
  ) {}

  @Post()
  create(@UserEntity() user: { id: string }, @Body() dto: CreateOrganizationDto) {
    const command: CreateOrganizationCommand = {
      name: dto.name,
      description: dto.description ?? null,
      logo: dto.logo ?? null,
    };
    return this.createOrganizationUseCase.execute(user.id, command);
  }

  @Get()
  findAllForUser(@UserEntity() user: { id: string }) {
    return this.findOrganizationsByUserIdUseCase.execute(user.id);
  }

  @Get(':slug')
  @RequireTenantRole(OrgRole.GUEST)
  findBySlug(@TenantId() orgId: string, @UserEntity() user: { id: string }) {
    return this.findOrganizationByIdUseCase.execute(orgId, user.id);
  }

  @Patch(':slug')
  @RequireTenantRole(OrgRole.ADMIN)
  update(@TenantId() orgId: string, @Body() dto: UpdateOrganizationDto) {
    const command: UpdateOrganizationCommand = {
      name: dto.name,
      description: dto.description,
      logo: dto.logo,
    };
    return this.updateOrganizationUseCase.execute(orgId, command);
  }

  @Delete(':slug')
  @RequireTenantRole(OrgRole.OWNER)
  async delete(@TenantId() orgId: string) {
    return await this.deleteOrganizationUseCase.execute(orgId);
  }

  @Get(':slug/members')
  @RequireTenantRole(OrgRole.GUEST)
  findMembers(@TenantId() orgId: string) {
    return this.findOrganizationMembersUseCase.execute(orgId);
  }

  @Get(':slug/members/:userId')
  @RequireTenantRole(OrgRole.GUEST)
  findMember(@TenantId() orgId: string, @Param('userId') userId: string) {
    return this.findOrganizationMemberUseCase.execute(orgId, userId);
  }
}
