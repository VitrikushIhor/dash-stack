import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { InvitationService } from './services/invitation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserEntity } from '../common/decorators/user.decorator';
import { User } from '@prisma/client';

@Controller('invitations')
export class InvitationAcceptController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post(':token/accept')
  @UseGuards(JwtAuthGuard)
  acceptInvite(@Param('token') token: string, @UserEntity() user: User) {
    return this.invitationService.acceptInvite(token, user.id, user.email);
  }
}
