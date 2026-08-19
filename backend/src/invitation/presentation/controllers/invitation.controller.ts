import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { OrgRole } from '../../../organization/domain/enums/org-role.enum';
import { UserEntity, AuthUser } from '../../../common/decorators/user.decorator';
import { TenantId } from '../../../organization/presentation/decorators/tenant.decorator';
import { RequireTenantRole } from '../../../organization/presentation/decorators/require-tenant-role.decorator';
import { CreateInvitationDto } from '../dto/create-invitation.dto';
import { SendInviteUseCase } from '../../application/use-cases/send-invite.use-case';
import { ListPendingInvitationsUseCase } from '../../application/use-cases/list-pending-invitations.use-case';
import { RevokeInviteUseCase } from '../../application/use-cases/revoke-invite.use-case';
import { SendInviteCommand } from '../../application/commands/send-invite.command';

@Controller('organizations/:slug/invitations')
export class InvitationController {
  constructor(
    private readonly sendInviteUseCase: SendInviteUseCase,
    private readonly listPendingUseCase: ListPendingInvitationsUseCase,
    private readonly revokeInviteUseCase: RevokeInviteUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @RequireTenantRole(OrgRole.ADMIN)
  sendInvite(
    @TenantId() orgId: string,
    @UserEntity() user: AuthUser,
    @Body() dto: CreateInvitationDto,
  ) {
    const command: SendInviteCommand = {
      email: dto.email,
      role: dto.role,
    };
    return this.sendInviteUseCase.execute(orgId, user.id, command);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @RequireTenantRole(OrgRole.ADMIN)
  listPending(@TenantId() orgId: string) {
    return this.listPendingUseCase.execute(orgId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @RequireTenantRole(OrgRole.ADMIN)
  revokeInvite(@TenantId() orgId: string, @Param('id') id: string) {
    return this.revokeInviteUseCase.execute(id, orgId);
  }
}
