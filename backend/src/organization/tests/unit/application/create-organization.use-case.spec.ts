import { CreateOrganizationUseCase } from '../../../application/use-cases/create-organization.use-case';
import { OrganizationRepositoryPort } from '../../../application/ports/organization.port';
import { OrganizationSlugService } from '../../../application/services/organization-slug.service';
import { OrganizationReadModel } from '../../../application/read-models/organization.read-model';

const mockOrganizationReadModel = (
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

describe('CreateOrganizationUseCase', () => {
  let useCase: CreateOrganizationUseCase;
  let repository: jest.Mocked<OrganizationRepositoryPort>;
  let slugService: jest.Mocked<OrganizationSlugService>;

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

    slugService = {
      generateUnique: jest.fn(),
    } as unknown as jest.Mocked<OrganizationSlugService>;

    useCase = new CreateOrganizationUseCase(repository, slugService);
  });

  it('generates a unique slug from the org name', async () => {
    slugService.generateUnique.mockResolvedValue('acme-corp');
    repository.create.mockResolvedValue(mockOrganizationReadModel());

    await useCase.execute('user-1', {
      name: 'Acme Corp',
      description: null,
      logo: null,
    });

    expect(slugService.generateUnique).toHaveBeenCalledWith('Acme Corp');
  });

  it('calls repository.create with correct data', async () => {
    slugService.generateUnique.mockResolvedValue('acme-corp');
    repository.create.mockResolvedValue(mockOrganizationReadModel());

    await useCase.execute('user-1', {
      name: 'Acme Corp',
      description: 'A great company',
      logo: null,
    });

    expect(repository.create).toHaveBeenCalledWith('user-1', 'acme-corp', {
      name: 'Acme Corp',
      description: 'A great company',
      logo: null,
    });
  });

  it('defaults description to null when undefined', async () => {
    slugService.generateUnique.mockResolvedValue('acme-corp');
    repository.create.mockResolvedValue(mockOrganizationReadModel());

    await useCase.execute('user-1', { name: 'Acme Corp' });

    expect(repository.create).toHaveBeenCalledWith(
      'user-1',
      'acme-corp',
      expect.objectContaining({ description: null }),
    );
  });

  it('defaults logo to null when undefined', async () => {
    slugService.generateUnique.mockResolvedValue('acme-corp');
    repository.create.mockResolvedValue(mockOrganizationReadModel());

    await useCase.execute('user-1', { name: 'Acme Corp' });

    expect(repository.create).toHaveBeenCalledWith(
      'user-1',
      'acme-corp',
      expect.objectContaining({ logo: null }),
    );
  });

  it('returns the created organization read model', async () => {
    const expected = mockOrganizationReadModel({ name: 'Acme Corp' });
    slugService.generateUnique.mockResolvedValue('acme-corp');
    repository.create.mockResolvedValue(expected);

    const result = await useCase.execute('user-1', { name: 'Acme Corp' });

    expect(result).toBe(expected);
  });
});
