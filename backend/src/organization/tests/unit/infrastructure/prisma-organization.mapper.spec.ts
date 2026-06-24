import { PrismaOrganizationMapper } from '../../../infrastructure/persistence/prisma-organization.mapper';

describe('PrismaOrganizationMapper', () => {
  describe('toReadModel()', () => {
    it('returns null for null input', () => {
      expect(PrismaOrganizationMapper.toReadModel(null)).toBeNull();
    });

    it('maps basic fields correctly', () => {
      const raw = {
        id: 'org-1',
        name: 'Acme Corp',
        description: 'A great company',
        logo: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-06-01'),
      };

      const result = PrismaOrganizationMapper.toReadModel(raw);

      expect(result).toMatchObject({
        id: 'org-1',
        name: 'Acme Corp',
        description: 'A great company',
        logo: null,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      });
    });

    it('maps _count to stats correctly', () => {
      const raw = {
        id: 'org-1',
        name: 'Acme',
        description: null,
        logo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: {
          memberships: 5,
          projects: 3,
          calendarEvents: 10,
        },
      };

      const result = PrismaOrganizationMapper.toReadModel(raw);

      expect(result?.stats).toEqual({
        members: 5,
        projects: 3,
        events: 10,
      });
    });

    it('sets stats to undefined when _count is absent', () => {
      const raw = {
        id: 'org-1',
        name: 'Acme',
        description: null,
        logo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = PrismaOrganizationMapper.toReadModel(raw);

      expect(result?.stats).toBeUndefined();
    });

    it('does not expose _count on the result', () => {
      const raw = {
        id: 'org-1',
        name: 'Acme',
        description: null,
        logo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { memberships: 1, projects: 0, calendarEvents: 0 },
      };

      const result = PrismaOrganizationMapper.toReadModel(raw) as any;

      expect(result?._count).toBeUndefined();
    });

    it('maps description = null correctly', () => {
      const raw = {
        id: 'org-1',
        name: 'Acme',
        description: null,
        logo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = PrismaOrganizationMapper.toReadModel(raw);

      expect(result?.description).toBeNull();
    });

    it('maps logo when present', () => {
      const raw = {
        id: 'org-1',
        name: 'Acme',
        description: null,
        logo: 'https://cdn.example.com/logo.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = PrismaOrganizationMapper.toReadModel(raw);

      expect(result?.logo).toBe('https://cdn.example.com/logo.png');
    });
  });
});
