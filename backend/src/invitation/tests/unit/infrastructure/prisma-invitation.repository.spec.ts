import { PrismaInvitationRepository } from '../../../infrastructure/persistence/prisma-invitation.repository';
import { OrgRole } from '@prisma/client';

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
  let prisma: any;

  beforeEach(() => {
    prisma = {
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
      },
      organization: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    repository = new PrismaInvitationRepository(prisma);
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

      const result = await repository.findMembershipByEmailAndOrg(
        'user@example.com',
        'org-1',
      );
      expect(result).toBe(membership);
    });

    it('returns null when not found', async () => {
      prisma.membership.findFirst.mockResolvedValue(null);

      const result = await repository.findMembershipByEmailAndOrg(
        'user@example.com',
        'org-1',
      );
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
    it('creates invitation and returns read model', async () => {
      const prismaResult = mockPrismaInvitation();
      prisma.invitation.create.mockResolvedValue(prismaResult);

      const result = await repository.create({
        email: 'user@example.com',
        role: OrgRole.MEMBER,
        orgId: 'org-1',
        invitedBy: 'admin-1',
        expiresAt: new Date('2026-07-01'),
      });

      expect(prisma.invitation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'user@example.com',
          role: OrgRole.MEMBER,
        }),
      });
      expect(result.id).toBe('inv-1');
      expect(result.token).toBe('token-abc');
    });
  });

  describe('findByToken()', () => {
    it('returns read model when invitation found', async () => {
      prisma.invitation.findUnique.mockResolvedValue(mockPrismaInvitation());

      const result = await repository.findByToken('token-abc');

      expect(prisma.invitation.findUnique).toHaveBeenCalledWith({
        where: { token: 'token-abc' },
      });
      expect(result).not.toBeNull();
      expect(result!.token).toBe('token-abc');
    });

    it('returns null when invitation not found', async () => {
      prisma.invitation.findUnique.mockResolvedValue(null);

      const result = await repository.findByToken('nonexistent');
      expect(result).toBeNull();
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
      expect(result!.id).toBe('inv-1');
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
          update: jest.fn().mockResolvedValue({}),
        },
      };
      prisma.$transaction.mockImplementation((cb: any) => cb(tx));

      const result = await repository.accept(
        'inv-1',
        'user-1',
        'org-1',
        OrgRole.MEMBER,
      );

      expect(tx.membership.findUnique).toHaveBeenCalledWith({
        where: { userId_orgId: { userId: 'user-1', orgId: 'org-1' } },
      });
      expect(tx.membership.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', orgId: 'org-1', role: OrgRole.MEMBER },
      });
      expect(tx.invitation.update).toHaveBeenCalledWith({
        where: { id: 'inv-1' },
        data: { acceptedAt: expect.any(Date) },
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
          update: jest.fn().mockResolvedValue({}),
        },
      };
      prisma.$transaction.mockImplementation((cb: any) => cb(tx));

      const result = await repository.accept(
        'inv-1',
        'user-1',
        'org-1',
        OrgRole.MEMBER,
      );

      expect(tx.membership.create).not.toHaveBeenCalled();
      expect(tx.invitation.update).toHaveBeenCalled();
      expect(result).toBe(existing);
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
    it('calls prisma.invitation.delete with correct id', async () => {
      prisma.invitation.delete.mockResolvedValue({});

      await repository.delete('inv-1');

      expect(prisma.invitation.delete).toHaveBeenCalledWith({
        where: { id: 'inv-1' },
      });
    });
  });
});
