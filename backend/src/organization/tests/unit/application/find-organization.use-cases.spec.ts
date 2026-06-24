import { FindOrganizationByIdUseCase } from '../../../application/use-cases/find-organization-by-id.use-case';
import { FindOrganizationsByUserIdUseCase } from '../../../application/use-cases/find-organizations-by-user-id.use-case';
import { OrganizationRepositoryPort } from '../../../application/ports/organization.port';
import { OrganizationReadModel } from '../../../application/read-models/organization.read-model';

const mockOrg = (
  overrides: Partial<OrganizationReadModel> = {},
): OrganizationReadModel => ({
  id: 'org-1',
  name: 'Acme Corp',
  description: null,
  logo: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

describe('FindOrganizationByIdUseCase', () => {
  let useCase: FindOrganizationByIdUseCase;
  let repository: jest.Mocked<OrganizationRepositoryPort>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findManyByUserId: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findOrganizationMembers: jest.fn(),
      findOrganizationMember: jest.fn(),
      existsBySlug: jest.fn(),
    };

    useCase = new FindOrganizationByIdUseCase(repository);
  });

  it('returns organization when found', async () => {
    const expected = mockOrg();
    repository.findById.mockResolvedValue(expected);

    const result = await useCase.execute('org-1');

    expect(result).toBe(expected);
    expect(repository.findById).toHaveBeenCalledWith('org-1');
  });

  it('returns null when not found', async () => {
    repository.findById.mockResolvedValue(null);

    const result = await useCase.execute('org-999');

    expect(result).toBeNull();
  });
});

describe('FindOrganizationsByUserIdUseCase', () => {
  let useCase: FindOrganizationsByUserIdUseCase;
  let repository: jest.Mocked<OrganizationRepositoryPort>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findManyByUserId: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findOrganizationMembers: jest.fn(),
      findOrganizationMember: jest.fn(),
      existsBySlug: jest.fn(),
    };

    useCase = new FindOrganizationsByUserIdUseCase(repository);
  });

  it('returns list of organizations for user', async () => {
    const expected = [mockOrg({ id: 'org-1' }), mockOrg({ id: 'org-2' })];
    repository.findManyByUserId.mockResolvedValue(expected);

    const result = await useCase.execute('user-1');

    expect(result).toBe(expected);
    expect(repository.findManyByUserId).toHaveBeenCalledWith('user-1');
  });

  it('returns empty array when user has no organizations', async () => {
    repository.findManyByUserId.mockResolvedValue([]);

    const result = await useCase.execute('user-no-orgs');

    expect(result).toEqual([]);
  });
});
