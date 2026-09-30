import { PrismaInvitationRepository } from '../../../infrastructure/persistence/prisma-invitation.repository';
import { OrgRole } from '../../../../organization/domain/enums/org-role.enum';
import { PrismaService } from 'nestjs-prisma';
import { createHash } from 'node:crypto';

const mockPrismaInvitation = (overrides?: Record<string, unknown>) => ({
  id: 'inv-1',
  email: 'user@example.com',
  role: 'MEMBER',
  orgId: 'org-1',
  invitedBy: 'admin-1',
  token: 'token-abc',
  expiresAt: new Date('2026-07-01'),
  acceptedAt: null,
  createdAt: new Date('2026-06-24'),
  ...overrides,
});

describe('PrismaInvitationRepository', () => {
  let repository: PrismaInvitationRepository;
  let prisma: ReturnType<typeof createPrismaMock>;

  const createPrismaMock = () => {
    return {
      membership: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      invitation: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      organization: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
    };
  };

  beforeEach(() => {
    prisma = createPrismaMock();
    repository = new PrismaInvitationRepository(prisma as unknown as PrismaService);
  });

  describe('findMembershipByEmailAndOrg()', () => {
    it('calls prisma.membership.findFirst with correct where', async () => {
      prisma.membership.findFirst.mockResolvedValue(null);

      await repository.findMembershipByEmailAndOrg('user@example.com', 'org-1');

      expect(prisma.membership.findFirst).toHaveBeenCalledWith({
        where: {
          orgId: 'org-1',
          user: { email: 'user@example.com' },
        },
      });
    });

    it('returns the membership when found', async () => {
      const membership = { id: 'mem-1' };
      prisma.membership.findFirst.mockResolvedValue(membership);

      const result = await repository.findMembershipByEmailAndOrg('user@example.com', 'org-1');
      expect(result).toBe(membership);
    });

    it('returns null when not found', async () => {
      prisma.membership.findFirst.mockResolvedValue(null);

      const result = await repository.findMembershipByEmailAndOrg('user@example.com', 'org-1');
      expect(result).toBeNull();
    });
  });

  describe('findPendingByEmailAndOrg()', () => {
    it('calls prisma.invitation.findFirst with pending filters', async () => {
      prisma.invitation.findFirst.mockResolvedValue(null);

      await repository.findPendingByEmailAndOrg('user@example.com', 'org-1');

      expect(prisma.invitation.findFirst).toHaveBeenCalledWith({
        where: {
          email: 'user@example.com',
          orgId: 'org-1',
          acceptedAt: null,
          expiresAt: { gt: expect.any(Date) },
        },
      });
    });
  });

  describe('findOrgById()', () => {
    it('calls prisma.organization.findUnique with name select', async () => {
      prisma.organization.findUnique.mockResolvedValue({ name: 'My Org' });

      const result = await repository.findOrgById('org-1');

      expect(prisma.organization.findUnique).toHaveBeenCalledWith({
        where: { id: 'org-1' },
        select: { name: true },
      });
      expect(result).toEqual({ name: 'My Org' });
    });

    it('returns null when org not found', async () => {
      prisma.organization.findUnique.mockResolvedValue(null);

      const result = await repository.findOrgById('org-unknown');
      expect(result).toBeNull();
    });
  });

  describe('create()', () => {
    it('should_store_only_token_hash_and_return_raw_token_for_email', async () => {
      const prismaResult = mockPrismaInvitation();
      prisma.invitation.create.mockResolvedValue(prismaResult);

      const result = await repository.create({
        email: 'user@example.com',
        role: OrgRole.MEMBER,
        orgId: 'org-1',
        invitedBy: 'admin-1',
        expiresAt: new Date('2026-07-01'),
      });

      expect(result.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
      const createInput = prisma.invitation.create.mock.calls[0]?.[0];
      expect(createInput.data.email).toBe('user@example.com');
      expect(createInput.data.role).toBe(OrgRole.MEMBER);
      expect(createInput.data.token).toMatch(/^[a-f0-9]{64}$/);
      expect(createInput.data.token).toBe(createHash('sha256').update(result.token).digest('hex'));
      expect(createInput.data.token).not.toBe(result.token);
      expect(result.invitation.id).toBe('inv-1');
      expect(result.invitation).not.toHaveProperty('token');
    });
  });

  describe('findByToken()', () => {
    it('should_lookup_by_hash_of_raw_token_without_exposing_digest', async () => {
      prisma.invitation.findUnique.mockResolvedValue(mockPrismaInvitation());
      const rawToken = 'a'.repeat(43);

      const result = await repository.findByToken(rawToken);

      expect(prisma.invitation.findUnique).toHaveBeenCalledWith({
        where: { token: createHash('sha256').update(rawToken).digest('hex') },
      });
      expect(result).not.toBeNull();
      expect(result).not.toHaveProperty('token');
    });

    it('returns null when invitation not found', async () => {
      prisma.invitation.findUnique.mockResolvedValue(null);

      const result = await repository.findByToken('a'.repeat(43));
      expect(result).toBeNull();
    });

    it('should_reject_malformed_token_without_database_lookup', async () => {
      await expect(repository.findByToken('nonexistent')).resolves.toBeNull();
      expect(prisma.invitation.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('findById()', () => {
    it('returns read model when invitation found', async () => {
      prisma.invitation.findUnique.mockResolvedValue(mockPrismaInvitation());

      const result = await repository.findById('inv-1');

      expect(prisma.invitation.findUnique).toHaveBeenCalledWith({
        where: { id: 'inv-1' },
      });
      expect(result).not.toBeNull();
      expect(result?.id).toBe('inv-1');
    });

    it('returns null when invitation not found', async () => {
      prisma.invitation.findUnique.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('accept()', () => {
    it('creates membership and marks invitation accepted when no existing membership', async () => {
      const membership = { id: 'mem-1', userId: 'user-1', orgId: 'org-1' };
      const tx = {
        membership: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue(membership),
        },
        invitation: {
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
      };
      prisma.$transaction.mockImplementation((cb: (transaction: typeof tx) => Promise<unknown>) =>
        cb(tx),
      );

      const result = await repository.accept(
        'inv-1',
        'user-1',
        'user@example.com',
        'org-1',
        OrgRole.MEMBER,
      );

      expect(tx.invitation.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'inv-1',
          email: { equals: 'user@example.com', mode: 'insensitive' },
          orgId: 'org-1',
          role: OrgRole.MEMBER,
          acceptedAt: null,
          expiresAt: { gt: expect.any(Date) },
        },
        data: { acceptedAt: expect.any(Date) },
      });
      expect(tx.invitation.updateMany.mock.invocationCallOrder[0]).toBeLessThan(
        tx.membership.create.mock.invocationCallOrder[0],
      );
      expect(tx.membership.findUnique).toHaveBeenCalledWith({
        where: { userId_orgId: { userId: 'user-1', orgId: 'org-1' } },
      });
      expect(tx.membership.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', orgId: 'org-1', role: OrgRole.MEMBER },
      });
      expect(result).toBe(membership);
    });

    it('returns existing membership without creating new one', async () => {
      const existing = { id: 'mem-existing', userId: 'user-1', orgId: 'org-1' };
      const tx = {
        membership: {
          findUnique: jest.fn().mockResolvedValue(existing),
          create: jest.fn(),
        },
        invitation: {
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
      };
      prisma.$transaction.mockImplementation((cb: (transaction: typeof tx) => Promise<unknown>) =>
        cb(tx),
      );

      const result = await repository.accept(
        'inv-1',
        'user-1',
        'user@example.com',
        'org-1',
        OrgRole.MEMBER,
      );

      expect(tx.membership.create).not.toHaveBeenCalled();
      expect(tx.invitation.updateMany).toHaveBeenCalled();
      expect(result).toBe(existing);
    });

    it('should_not_create_membership_when_invitation_was_consumed_or_revoked', async () => {
      const tx = {
        membership: { findUnique: jest.fn(), create: jest.fn() },
        invitation: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
      };
      prisma.$transaction.mockImplementation((cb: (transaction: typeof tx) => Promise<unknown>) =>
        cb(tx),
      );

      await expect(
        repository.accept('inv-1', 'user-1', 'user@example.com', 'org-1', OrgRole.MEMBER),
      ).rejects.toThrow('Invitation is no longer valid');
      expect(tx.membership.findUnique).not.toHaveBeenCalled();
      expect(tx.membership.create).not.toHaveBeenCalled();
    });
  });

  describe('listPending()', () => {
    it('returns mapped read models', async () => {
      const invitations = [
        mockPrismaInvitation({ id: 'inv-1' }),
        mockPrismaInvitation({ id: 'inv-2', email: 'other@example.com' }),
      ];
      prisma.invitation.findMany.mockResolvedValue(invitations);

      const result = await repository.listPending('org-1');

      expect(prisma.invitation.findMany).toHaveBeenCalledWith({
        where: {
          orgId: 'org-1',
          acceptedAt: null,
          expiresAt: { gt: expect.any(Date) },
        },
      });
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('inv-1');
      expect(result[1].id).toBe('inv-2');
    });

    it('returns empty array when no pending invitations', async () => {
      prisma.invitation.findMany.mockResolvedValue([]);

      const result = await repository.listPending('org-1');
      expect(result).toEqual([]);
    });
  });

  describe('delete()', () => {
    it('should_revoke_only_pending_invitation_in_the_requested_org', async () => {
      prisma.invitation.deleteMany.mockResolvedValue({ count: 1 });

      await repository.delete('inv-1', 'org-1');

      expect(prisma.invitation.deleteMany).toHaveBeenCalledWith({
        where: { id: 'inv-1', orgId: 'org-1', acceptedAt: null },
      });
    });

    it('should_reject_revoke_when_parallel_accept_already_consumed_invitation', async () => {
      prisma.invitation.deleteMany.mockResolvedValue({ count: 0 });

      await expect(repository.delete('inv-1', 'org-1')).rejects.toThrow(
        'Invitation is no longer valid',
      );
    });
  });
});
