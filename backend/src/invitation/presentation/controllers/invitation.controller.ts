import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import {
  MembershipRoleGuard,
  RequireOrgRole,
} from '../../../common/guards/membership-role.guard';
import { OrgRole, User } from '@prisma/client';
import { UserEntity } from '../../../common/decorators/user.decorator';
import { CreateInvitationDto } from '../dto/create-invitation.dto';
import { SendInviteUseCase } from '../../application/use-cases/send-invite.use-case';
import { ListPendingInvitationsUseCase } from '../../application/use-cases/list-pending-invitations.use-case';
import { RevokeInviteUseCase } from '../../application/use-cases/revoke-invite.use-case';
import { SendInviteCommand } from '../../application/commands/send-invite.command';

@Controller('organizations/:orgId/invitations')
export class InvitationController {
  constructor(
    private readonly sendInviteUseCase: SendInviteUseCase,
    private readonly listPendingUseCase: ListPendingInvitationsUseCase,
    private readonly revokeInviteUseCase: RevokeInviteUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, MembershipRoleGuard)
  @RequireOrgRole(OrgRole.ADMIN)
  sendInvite(
    @Param('orgId') orgId: string,
    @UserEntity() user: User,
    @Body() dto: CreateInvitationDto,
  ) {
    const command: SendInviteCommand = {
      email: dto.email,
      role: dto.role,
    };
    return this.sendInviteUseCase.execute(orgId, user.id, command);
  }

  @Get()
  @UseGuards(JwtAuthGuard, MembershipRoleGuard)
  @RequireOrgRole(OrgRole.ADMIN)
  listPending(@Param('orgId') orgId: string) {
    return this.listPendingUseCase.execute(orgId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, MembershipRoleGuard)
  @RequireOrgRole(OrgRole.ADMIN)
  revokeInvite(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.revokeInviteUseCase.execute(id, orgId);
  }
}
