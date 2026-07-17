import { InvitationPolicy } from './../../domain/policies/invitation.policy';
import { Inject, Injectable } from '@nestjs/common';
import { InvitationRepositoryPort } from '../ports/invitation.repository.port';
import { AcceptInviteCommand } from '../commands/accept-invite.command';

@Injectable()
export class AcceptInviteUseCase {
  constructor(
    @Inject('InvitationRepositoryPort')
    private readonly repository: InvitationRepositoryPort,
  ) {}

  async execute(command: AcceptInviteCommand) {
    const invitation = await this.repository.findByToken(command.token);

    InvitationPolicy.assertCanAccept(invitation, command.userEmail);

    return this.repository.accept(
      invitation.id,
      command.userId,
      invitation.orgId,
      invitation.role,
    );
  }
}
