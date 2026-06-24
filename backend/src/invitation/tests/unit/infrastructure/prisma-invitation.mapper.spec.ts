import { PrismaInvitationMapper } from '../../../infrastructure/persistence/prisma-invitation.mapper';
import { OrgRole } from '@prisma/client';

const basePrismaInvitation = () => ({
  id: 'inv-1',
  email: 'user@example.com',
  role: 'MEMBER' as string,
  orgId: 'org-1',
  invitedBy: 'admin-1',
  token: 'token-abc-123',
  expiresAt: new Date('2026-07-01T00:00:00.000Z'),
  acceptedAt: null as Date | null,
  createdAt: new Date('2026-06-24T00:00:00.000Z'),
});

describe('PrismaInvitationMapper', () => {
  describe('toReadModel()', () => {
    it('maps all scalar fields correctly', () => {
      const payload = basePrismaInvitation();
      const result = PrismaInvitationMapper.toReadModel(payload);

      expect(result.id).toBe('inv-1');
      expect(result.email).toBe('user@example.com');
      expect(result.role).toBe(OrgRole.MEMBER);
      expect(result.orgId).toBe('org-1');
      expect(result.invitedBy).toBe('admin-1');
      expect(result.token).toBe('token-abc-123');
    });

    it('maps dates correctly', () => {
      const payload = basePrismaInvitation();
      const result = PrismaInvitationMapper.toReadModel(payload);

      expect(result.expiresAt).toBe(payload.expiresAt);
      expect(result.createdAt).toBe(payload.createdAt);
    });

    it('maps null acceptedAt correctly', () => {
      const payload = basePrismaInvitation();
      const result = PrismaInvitationMapper.toReadModel(payload);

      expect(result.acceptedAt).toBeNull();
    });

    it('maps non-null acceptedAt correctly', () => {
      const acceptedAt = new Date('2026-06-25T12:00:00.000Z');
      const payload = { ...basePrismaInvitation(), acceptedAt };
      const result = PrismaInvitationMapper.toReadModel(payload);

      expect(result.acceptedAt).toBe(acceptedAt);
    });

    it('casts role string to OrgRole enum', () => {
      const payload = { ...basePrismaInvitation(), role: 'ADMIN' };
      const result = PrismaInvitationMapper.toReadModel(payload);

      expect(result.role).toBe(OrgRole.ADMIN);
    });
  });
});
