import { AcceptInviteUseCase } from '../../../application/use-cases/accept-invite.use-case';
import { InvitationRepositoryPort } from '../../../application/ports/invitation.repository.port';
import { PendingInvitationReadModel } from '../../../application/read-models/pending-invitation.read-model';
import { AcceptInviteCommand } from '../../../application/commands/accept-invite.command';
import { OrgRole } from '@prisma/client';
import { InvitationNotFoundException } from '../../../domain/exceptions/invitation-not-found.exception';
import {
  InvitationEmailMismatchException,
  InvitationAlreadyAcceptedException,
  InvitationExpiredException,
} from '../../../domain/exceptions/invitation-invalid.exception';

const mockInvitation = (
  overrides?: Partial<PendingInvitationReadModel>,
): PendingInvitationReadModel => ({
  id: 'inv-1',
  email: 'user@example.com',
  role: OrgRole.MEMBER,
  orgId: 'org-1',
  invitedBy: 'admin-1',
  token: 'token-abc',
  expiresAt: new Date(Date.now() + 86400000),
  acceptedAt: null,
  createdAt: new Date(),
  ...overrides,
});

describe('AcceptInviteUseCase', () => {
  let useCase: AcceptInviteUseCase;
  let repository: jest.Mocked<InvitationRepositoryPort>;

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
    useCase = new AcceptInviteUseCase(repository);
  });

  const command: AcceptInviteCommand = {
    token: 'token-abc',
    userId: 'user-1',
    userEmail: 'user@example.com',
  };

  it('should successfully accept an invitation', async () => {
    const invitation = mockInvitation();
    const membership = { id: 'membership-1', userId: 'user-1', orgId: 'org-1' };

    repository.findByToken.mockResolvedValue(invitation);
    repository.accept.mockResolvedValue(membership);

    const result = await useCase.execute(command);

    expect(result).toBe(membership);
    expect(repository.findByToken).toHaveBeenCalledWith('token-abc');
    expect(repository.accept).toHaveBeenCalledWith(
      'inv-1',
      'user-1',
      'org-1',
      OrgRole.MEMBER,
    );
  });

  it('should throw InvitationNotFoundException when token is invalid', async () => {
    repository.findByToken.mockResolvedValue(null);

    await expect(useCase.execute(command)).rejects.toThrow(
      InvitationNotFoundException,
    );
    expect(repository.accept).not.toHaveBeenCalled();
  });

  it('should throw InvitationEmailMismatchException when emails differ', async () => {
    repository.findByToken.mockResolvedValue(mockInvitation());

    await expect(
      useCase.execute({ ...command, userEmail: 'other@example.com' }),
    ).rejects.toThrow(InvitationEmailMismatchException);
    expect(repository.accept).not.toHaveBeenCalled();
  });

  it('should accept when emails differ only by case', async () => {
    const invitation = mockInvitation();
    repository.findByToken.mockResolvedValue(invitation);
    repository.accept.mockResolvedValue({});

    await expect(
      useCase.execute({ ...command, userEmail: 'USER@EXAMPLE.COM' }),
    ).resolves.not.toThrow();
    expect(repository.accept).toHaveBeenCalled();
  });

  it('should throw InvitationAlreadyAcceptedException when already accepted', async () => {
    repository.findByToken.mockResolvedValue(
      mockInvitation({ acceptedAt: new Date() }),
    );

    await expect(useCase.execute(command)).rejects.toThrow(
      InvitationAlreadyAcceptedException,
    );
    expect(repository.accept).not.toHaveBeenCalled();
  });

  it('should throw InvitationExpiredException when invitation is expired', async () => {
    repository.findByToken.mockResolvedValue(
      mockInvitation({ expiresAt: new Date(Date.now() - 86400000) }),
    );

    await expect(useCase.execute(command)).rejects.toThrow(
      InvitationExpiredException,
    );
    expect(repository.accept).not.toHaveBeenCalled();
  });
});
