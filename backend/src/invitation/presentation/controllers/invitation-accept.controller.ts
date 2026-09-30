import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { UserEntity, AuthUser } from '../../../common/decorators/user.decorator';
import { AcceptInviteCommand } from './../../application/commands/accept-invite.command';
import { AcceptInviteUseCase } from './../../application/use-cases/accept-invite.use-case';
import { AcceptInvitationDto } from '../dto/accept-invitation.dto';

@Controller('invitations')
export class InvitationAcceptController {
  constructor(private readonly acceptInviteUseCase: AcceptInviteUseCase) {}

  @Post('accept')
  @UseGuards(JwtAuthGuard)
  acceptInvite(@Body() { token }: AcceptInvitationDto, @UserEntity() user: AuthUser) {
    const command: AcceptInviteCommand = {
      token,
      userId: user.id,
      userEmail: user.email,
    };
    return this.acceptInviteUseCase.execute(command);
  }
}
