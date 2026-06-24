import { InvitationPolicy } from '../../../domain/policies/invitation.policy';
import {
  AlreadyMemberException,
  InvitationAlreadySentException,
} from '../../../domain/exceptions/invitation-conflict.exception';
import {
  InvitationNotFoundException,
  InvitationNotInOrgException,
  OrgNotFoundException,
} from '../../../domain/exceptions/invitation-not-found.exception';
import {
  InvitationEmailMismatchException,
  InvitationAlreadyAcceptedException,
  InvitationExpiredException,
} from '../../../domain/exceptions/invitation-invalid.exception';

describe('InvitationPolicy', () => {
  describe('assertNotAlreadyMember()', () => {
    it('does not throw when member is null', () => {
      expect(() => InvitationPolicy.assertNotAlreadyMember(null)).not.toThrow();
    });

    it('does not throw when member is undefined', () => {
      expect(() =>
        InvitationPolicy.assertNotAlreadyMember(undefined),
      ).not.toThrow();
    });

    it('throws AlreadyMemberException when member exists', () => {
      expect(() =>
        InvitationPolicy.assertNotAlreadyMember({ id: 'membership-1' }),
      ).toThrow(AlreadyMemberException);
    });
  });

  describe('assertNoPendingInvite()', () => {
    it('does not throw when no pending invite', () => {
      expect(() => InvitationPolicy.assertNoPendingInvite(null)).not.toThrow();
    });

    it('throws InvitationAlreadySentException when pending invite exists', () => {
      expect(() =>
        InvitationPolicy.assertNoPendingInvite({ id: 'invite-1' }),
      ).toThrow(InvitationAlreadySentException);
    });
  });

  describe('assertCanAccept()', () => {
    const validInvitation = {
      email: 'user@example.com',
      acceptedAt: null,
      expiresAt: new Date(Date.now() + 86400000), // +1 day
    };

    it('does not throw for valid invitation', () => {
      expect(() =>
        InvitationPolicy.assertCanAccept(validInvitation, 'user@example.com'),
      ).not.toThrow();
    });

    it('throws InvitationNotFoundException when invitation is null', () => {
      expect(() =>
        InvitationPolicy.assertCanAccept(null, 'user@example.com'),
      ).toThrow(InvitationNotFoundException);
    });

    it('throws InvitationEmailMismatchException when emails differ', () => {
      expect(() =>
        InvitationPolicy.assertCanAccept(validInvitation, 'other@example.com'),
      ).toThrow(InvitationEmailMismatchException);
    });

    it('does not throw when emails differ only by case', () => {
      expect(() =>
        InvitationPolicy.assertCanAccept(validInvitation, 'USER@EXAMPLE.COM'),
      ).not.toThrow();
    });

    it('throws InvitationAlreadyAcceptedException when already accepted', () => {
      const accepted = { ...validInvitation, acceptedAt: new Date() };
      expect(() =>
        InvitationPolicy.assertCanAccept(accepted, 'user@example.com'),
      ).toThrow(InvitationAlreadyAcceptedException);
    });

    it('throws InvitationExpiredException when expired', () => {
      const expired = {
        ...validInvitation,
        expiresAt: new Date(Date.now() - 86400000), // -1 day
      };
      expect(() =>
        InvitationPolicy.assertCanAccept(expired, 'user@example.com'),
      ).toThrow(InvitationExpiredException);
    });
  });

  describe('assertBelongsToOrg()', () => {
    it('does not throw when invitation belongs to org', () => {
      expect(() =>
        InvitationPolicy.assertBelongsToOrg({ orgId: 'org-1' }, 'org-1'),
      ).not.toThrow();
    });

    it('throws InvitationNotInOrgException when invitation is null', () => {
      expect(() => InvitationPolicy.assertBelongsToOrg(null, 'org-1')).toThrow(
        InvitationNotInOrgException,
      );
    });

    it('throws InvitationNotInOrgException when orgId does not match', () => {
      expect(() =>
        InvitationPolicy.assertBelongsToOrg({ orgId: 'org-2' }, 'org-1'),
      ).toThrow(InvitationNotInOrgException);
    });
  });

  describe('assertOrgExists()', () => {
    it('does not throw when org exists', () => {
      expect(() =>
        InvitationPolicy.assertOrgExists({ name: 'My Org' }),
      ).not.toThrow();
    });

    it('throws OrgNotFoundException when org is null', () => {
      expect(() => InvitationPolicy.assertOrgExists(null)).toThrow(
        OrgNotFoundException,
      );
    });

    it('throws OrgNotFoundException when org is undefined', () => {
      expect(() => InvitationPolicy.assertOrgExists(undefined)).toThrow(
        OrgNotFoundException,
      );
    });
  });
});
