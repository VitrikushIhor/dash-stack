import { InvitationEmail } from '../value-objects/invitation-email.vo';
import {
  AlreadyMemberException,
  InvitationAlreadySentException,
} from '../exceptions/invitation-conflict.exception';
import {
  InvitationNotFoundException,
  InvitationNotInOrgException,
  OrgNotFoundException,
} from '../exceptions/invitation-not-found.exception';
import {
  InvitationEmailMismatchException,
  InvitationAlreadyAcceptedException,
  InvitationExpiredException,
} from '../exceptions/invitation-invalid.exception';

export class InvitationPolicy {
  static assertNotAlreadyMember(existingMember: unknown): void {
    if (existingMember) {
      throw new AlreadyMemberException();
    }
  }

  static assertNoPendingInvite(pendingInvite: unknown): void {
    if (pendingInvite) {
      throw new InvitationAlreadySentException();
    }
  }

  static assertCanAccept(
    invitation: {
      email: string;
      acceptedAt: Date | null;
      expiresAt: Date;
    } | null,
    userEmail: string,
  ): asserts invitation is NonNullable<typeof invitation> {
    if (!invitation) {
      throw new InvitationNotFoundException();
    }

    const invitationEmail = new InvitationEmail(invitation.email);
    if (!invitationEmail.equals(userEmail)) {
      throw new InvitationEmailMismatchException();
    }

    if (invitation.acceptedAt) {
      throw new InvitationAlreadyAcceptedException();
    }

    if (invitation.expiresAt < new Date()) {
      throw new InvitationExpiredException();
    }
  }

  static assertBelongsToOrg(
    invitation: { orgId: string } | null,
    orgId: string,
  ): asserts invitation is NonNullable<typeof invitation> {
    if (!invitation || invitation.orgId !== orgId) {
      throw new InvitationNotInOrgException();
    }
  }

  static assertOrgExists(org: unknown): asserts org is NonNullable<typeof org> {
    if (!org) {
      throw new OrgNotFoundException();
    }
  }
}
