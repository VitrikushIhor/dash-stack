import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
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

@Controller('organizations/:orgId/invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post()
  @UseGuards(JwtAuthGuard, MembershipRoleGuard)
  @RequireOrgRole(OrgRole.ADMIN)
  sendInvite(
    @Param('orgId') orgId: string,
    @UserEntity() user: User,
    @Body() dto: CreateInvitationDto,
  ) {
    return this.invitationService.sendInvite(orgId, user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, MembershipRoleGuard)
  @RequireOrgRole(OrgRole.ADMIN)
  listPending(@Param('orgId') orgId: string) {
    return this.invitationService.listPending(orgId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, MembershipRoleGuard)
  @RequireOrgRole(OrgRole.ADMIN)
  revokeInvite(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.invitationService.revokeInvite(id, orgId);
  }
}
