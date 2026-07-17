import { ListPendingInvitationsUseCase } from '../../../application/use-cases/list-pending-invitations.use-case';
import { InvitationRepositoryPort } from '../../../application/ports/invitation.repository.port';
import { PendingInvitationReadModel } from '../../../application/read-models/pending-invitation.read-model';
import { OrgRole } from '@prisma/client';

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

describe('ListPendingInvitationsUseCase', () => {
  let useCase: ListPendingInvitationsUseCase;
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
    useCase = new ListPendingInvitationsUseCase(repository);
  });

  it('should return pending invitations from repository', async () => {
    const invitations = [
      mockInvitation({ id: 'inv-1' }),
      mockInvitation({ id: 'inv-2', email: 'other@example.com' }),
    ];
    repository.listPending.mockResolvedValue(invitations);

    const result = await useCase.execute('org-1');

    expect(result).toBe(invitations);
    expect(repository.listPending).toHaveBeenCalledWith('org-1');
  });

  it('should return empty array when no pending invitations', async () => {
    repository.listPending.mockResolvedValue([]);

    const result = await useCase.execute('org-1');

    expect(result).toEqual([]);
  });
});
