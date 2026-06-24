import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { UserEntity } from '../../../common/decorators/user.decorator';
import { User } from '@prisma/client';
import { AcceptInviteCommand } from './../../application/commands/accept-invite.command';
import { AcceptInviteUseCase } from './../../application/use-cases/accept-invite.use-case';

@Controller('invitations')
export class InvitationAcceptController {
  constructor(private readonly acceptInviteUseCase: AcceptInviteUseCase) {}

  @Post(':token/accept')
  @UseGuards(JwtAuthGuard)
  acceptInvite(@Param('token') token: string, @UserEntity() user: User) {
    const command: AcceptInviteCommand = {
      token,
      userId: user.id,
      userEmail: user.email,
    };
    return this.acceptInviteUseCase.execute(command);
  }
}
