import { RevokeInviteUseCase } from '../../../application/use-cases/revoke-invite.use-case';
import { InvitationRepositoryPort } from '../../../application/ports/invitation.repository.port';
import { PendingInvitationReadModel } from '../../../application/read-models/pending-invitation.read-model';
import { OrgRole } from '@prisma/client';
import { InvitationNotInOrgException } from '../../../domain/exceptions/invitation-not-found.exception';

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

describe('RevokeInviteUseCase', () => {
  let useCase: RevokeInviteUseCase;
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
    useCase = new RevokeInviteUseCase(repository);
  });

  it('should successfully revoke an invitation', async () => {
    repository.findById.mockResolvedValue(mockInvitation());
    repository.delete.mockResolvedValue(undefined);

    await useCase.execute('inv-1', 'org-1');

    expect(repository.findById).toHaveBeenCalledWith('inv-1');
    expect(repository.delete).toHaveBeenCalledWith('inv-1');
  });

  it('should throw InvitationNotInOrgException when invitation is null', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('inv-1', 'org-1')).rejects.toThrow(
      InvitationNotInOrgException,
    );
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('should throw InvitationNotInOrgException when orgId does not match', async () => {
    repository.findById.mockResolvedValue(
      mockInvitation({ orgId: 'org-other' }),
    );

    await expect(useCase.execute('inv-1', 'org-1')).rejects.toThrow(
      InvitationNotInOrgException,
    );
    expect(repository.delete).not.toHaveBeenCalled();
  });
});
