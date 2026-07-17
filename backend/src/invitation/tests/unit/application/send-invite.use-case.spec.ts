import { SendInviteUseCase } from '../../../application/use-cases/send-invite.use-case';
import { InvitationRepositoryPort } from '../../../application/ports/invitation.repository.port';
import { InvitationMailerPort } from '../../../application/ports/invitation-mailer.port';
import { PendingInvitationReadModel } from '../../../application/read-models/pending-invitation.read-model';
import { SendInviteCommand } from '../../../application/commands/send-invite.command';
import { OrgRole } from '@prisma/client';
import {
  AlreadyMemberException,
  InvitationAlreadySentException,
} from '../../../domain/exceptions/invitation-conflict.exception';
import { OrgNotFoundException } from '../../../domain/exceptions/invitation-not-found.exception';

const mockInvitation = (
  overrides?: Partial<PendingInvitationReadModel>,
): PendingInvitationReadModel => ({
  id: 'inv-1',
  email: 'user@example.com',
  role: OrgRole.MEMBER,
  orgId: 'org-1',
  invitedBy: 'admin-1',
  token: 'token-abc',
  expiresAt: new Date(Date.now() + 7 * 86400000),
  acceptedAt: null,
  createdAt: new Date(),
  ...overrides,
});

describe('SendInviteUseCase', () => {
  let useCase: SendInviteUseCase;
  let repository: jest.Mocked<InvitationRepositoryPort>;
  let mailer: jest.Mocked<InvitationMailerPort>;

  beforeEach(() => {
    repository = {
      findMembershipByEmailAndOrg: jest.fn(),
      findPendingByEmailAndOrg: jest.fn(),
      findOrgById: jest.fn(),
      findByToken: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      accept: jest.fn(),
      listPending: jest.fn(),
      delete: jest.fn(),
    };
    mailer = {
      sendInviteEmail: jest.fn(),
    };
    useCase = new SendInviteUseCase(repository, mailer);
  });

  const command: SendInviteCommand = {
    email: '  User@Example.COM  ',
    role: OrgRole.MEMBER,
  };

  it('should successfully send an invitation', async () => {
    const invitation = mockInvitation();

    repository.findMembershipByEmailAndOrg.mockResolvedValue(null);
    repository.findPendingByEmailAndOrg.mockResolvedValue(null);
    repository.findOrgById.mockResolvedValue({ name: 'My Org' });
    repository.create.mockResolvedValue(invitation);
    mailer.sendInviteEmail.mockResolvedValue(undefined);

    const result = await useCase.execute('org-1', 'admin-1', command);

    expect(result).toBe(invitation);
    expect(repository.findMembershipByEmailAndOrg).toHaveBeenCalledWith(
      'user@example.com',
      'org-1',
    );
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@example.com',
        role: OrgRole.MEMBER,
        orgId: 'org-1',
        invitedBy: 'admin-1',
        expiresAt: expect.any(Date),
      }),
    );
    expect(mailer.sendInviteEmail).toHaveBeenCalledWith(
      'user@example.com',
      invitation.token,
      'My Org',
    );
  });

  it('should normalize email before checking', async () => {
    repository.findMembershipByEmailAndOrg.mockResolvedValue(null);
    repository.findPendingByEmailAndOrg.mockResolvedValue(null);
    repository.findOrgById.mockResolvedValue({ name: 'Org' });
    repository.create.mockResolvedValue(mockInvitation());

    await useCase.execute('org-1', 'admin-1', command);

    expect(repository.findMembershipByEmailAndOrg).toHaveBeenCalledWith(
      'user@example.com',
      'org-1',
    );
  });

  it('should throw AlreadyMemberException if user is already a member', async () => {
    repository.findMembershipByEmailAndOrg.mockResolvedValue({
      id: 'membership-1',
    });

    await expect(useCase.execute('org-1', 'admin-1', command)).rejects.toThrow(
      AlreadyMemberException,
    );

    expect(repository.create).not.toHaveBeenCalled();
    expect(mailer.sendInviteEmail).not.toHaveBeenCalled();
  });

  it('should throw InvitationAlreadySentException if pending invite exists', async () => {
    repository.findMembershipByEmailAndOrg.mockResolvedValue(null);
    repository.findPendingByEmailAndOrg.mockResolvedValue({ id: 'inv-old' });

    await expect(useCase.execute('org-1', 'admin-1', command)).rejects.toThrow(
      InvitationAlreadySentException,
    );

    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should throw OrgNotFoundException if organization does not exist', async () => {
    repository.findMembershipByEmailAndOrg.mockResolvedValue(null);
    repository.findPendingByEmailAndOrg.mockResolvedValue(null);
    repository.findOrgById.mockResolvedValue(null);

    await expect(useCase.execute('org-1', 'admin-1', command)).rejects.toThrow(
      OrgNotFoundException,
    );

    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should set expiresAt 7 days in the future', async () => {
    repository.findMembershipByEmailAndOrg.mockResolvedValue(null);
    repository.findPendingByEmailAndOrg.mockResolvedValue(null);
    repository.findOrgById.mockResolvedValue({ name: 'Org' });
    repository.create.mockResolvedValue(mockInvitation());

    const before = new Date();
    await useCase.execute('org-1', 'admin-1', command);

    const createCall = repository.create.mock.calls[0][0];
    const daysDiff =
      (createCall.expiresAt.getTime() - before.getTime()) / 86400000;
    expect(daysDiff).toBeGreaterThanOrEqual(6.9);
    expect(daysDiff).toBeLessThanOrEqual(7.1);
  });
});
