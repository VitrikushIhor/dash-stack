import { Inject, Injectable } from '@nestjs/common';
import { InvitationRepositoryPort } from '../ports/invitation.repository.port';
import { InvitationMailerPort } from '../ports/invitation-mailer.port';
import { SendInviteCommand } from '../commands/send-invite.command';
import { InvitationPolicy } from './../../domain/policies/invitation.policy';
import { InvitationEmail } from './../../domain/value-objects/invitation-email.vo';
import { INVITATION_EXPIRATION_DAYS } from './../../domain/constants/invitation.constants';
import { InternalErrorException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class SendInviteUseCase {
  constructor(
    @Inject('InvitationRepositoryPort')
    private readonly repository: InvitationRepositoryPort,
    @Inject('InvitationMailerPort')
    private readonly mailer: InvitationMailerPort,
  ) {}

  async execute(orgId: string, invitedBy: string, command: SendInviteCommand) {
    InvitationPolicy.assertInvitableRole(command.role);

    const email = new InvitationEmail(command.email);

    const existingMember = await this.repository.findMembershipByEmailAndOrg(email.value, orgId);
    InvitationPolicy.assertNotAlreadyMember(existingMember);

    const pendingInvite = await this.repository.findPendingByEmailAndOrg(email.value, orgId);
    InvitationPolicy.assertNoPendingInvite(pendingInvite);

    const org = await this.repository.findOrgById(orgId);
    InvitationPolicy.assertOrgExists(org);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRATION_DAYS);

    const created = await this.repository.create({
      email: email.value,
      role: command.role,
      orgId,
      invitedBy,
      expiresAt,
    });

    try {
      await this.mailer.sendInviteEmail(email.value, created.token, org.name);
    } catch (error) {
      try {
        await this.repository.delete(created.invitation.id, orgId);
      } catch {
        throw new InternalErrorException(
          'Invitation delivery failed and pending invitation cleanup failed',
        );
      }
      throw error;
    }

    return created.invitation;
  }
}
