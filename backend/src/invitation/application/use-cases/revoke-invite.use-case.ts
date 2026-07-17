import { Inject, Injectable } from '@nestjs/common';
import { InvitationRepositoryPort } from '../ports/invitation.repository.port';
import { InvitationPolicy } from './../../domain/policies/invitation.policy';

@Injectable()
export class RevokeInviteUseCase {
  constructor(
    @Inject('InvitationRepositoryPort')
    private readonly repository: InvitationRepositoryPort,
  ) {}

  async execute(invitationId: string, orgId: string) {
    const invitation = await this.repository.findById(invitationId);

    InvitationPolicy.assertBelongsToOrg(invitation, orgId);

    await this.repository.delete(invitationId);
  }
}
