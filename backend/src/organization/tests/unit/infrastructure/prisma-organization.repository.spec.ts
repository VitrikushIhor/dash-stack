import { PrismaOrganizationRepository } from '../../../infrastructure/persistence/prisma-organization.repository';
import { PrismaService } from 'nestjs-prisma';

describe('PrismaOrganizationRepository', () => {
  let repository: PrismaOrganizationRepository;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      organization: {
        create: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    repository = new PrismaOrganizationRepository(prismaMock as any);
  });

  describe('create', () => {
    it('should create an organization with a generated slug and default seeded labels', async () => {
      // Arrange
      const userId = 'user-1';
      const data = {
        name: 'My Org',
        description: 'Test description',
        logo: 'logo.png',
      };

      const createdOrg = {
        id: 'org-1',
        name: 'My Org',
        slug: 'my-org',
        createdAt: new Date(),
        updatedAt: new Date(),
        memberships: [],
        labels: [],
        _count: {
          memberships: 1,
          projects: 0,
        },
      };

      prismaMock.organization.count.mockResolvedValue(0); // For unique slug generation
      prismaMock.organization.create.mockResolvedValue(createdOrg);

      await repository.create(userId, 'my-org', data);

      // Assert
      expect(prismaMock.organization.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'My Org',
            slug: 'my-org', // should generate my-org since count is 0
            memberships: {
              create: {
                userId,
                role: 'OWNER',
              },
            },
            labels: {
              create: expect.arrayContaining([
                expect.objectContaining({ name: 'Bug', color: 'red' }),
                expect.objectContaining({ name: 'Feature', color: 'blue' }),
                expect.objectContaining({ name: 'Internal', color: 'orange' }),
              ]),
            },
          }),
        }),
      );
    });
  });
});
