import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { InvitationService } from './services/invitation.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  MembershipRoleGuard,
  RequireOrgRole,
} from '../common/guards/membership-role.guard';
import { OrgRole, User } from '@prisma/client';
import { UserEntity } from '../common/decorators/user.decorator';

@Controller()
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post('organizations/:orgId/invitations')
  @UseGuards(JwtAuthGuard, MembershipRoleGuard)
  @RequireOrgRole(OrgRole.ADMIN)
  sendInvite(
    @Param('orgId') orgId: string,
    @UserEntity() user: User,
    @Body() dto: CreateInvitationDto,
  ) {
    return this.invitationService.sendInvite(orgId, user.id, dto);
  }

  @Get('organizations/:orgId/invitations')
  @UseGuards(JwtAuthGuard, MembershipRoleGuard)
  @RequireOrgRole(OrgRole.ADMIN)
  listPending(@Param('orgId') orgId: string) {
    return this.invitationService.listPending(orgId);
  }

  @Delete('organizations/:orgId/invitations/:id')
  @UseGuards(JwtAuthGuard, MembershipRoleGuard)
  @RequireOrgRole(OrgRole.ADMIN)
  revokeInvite(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.invitationService.revokeInvite(id, orgId);
  }

  @Post('invitations/:token/accept')
  @UseGuards(JwtAuthGuard)
  acceptInvite(@Param('token') token: string, @UserEntity() user: User) {
    return this.invitationService.acceptInvite(token, user.id);
  }
}
