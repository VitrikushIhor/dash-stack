import { UpdateOrganizationUseCase } from '../../../application/use-cases/update-organization.use-case';
import { OrganizationRepositoryPort } from '../../../application/ports/organization.port';
import { OrganizationNotFoundException } from '../../../domain/exceptions/organization-not-found.exception';
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

describe('UpdateOrganizationUseCase', () => {
  let useCase: UpdateOrganizationUseCase;
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

    useCase = new UpdateOrganizationUseCase(repository);
  });

  it('calls repository.update with correct orgId and command', async () => {
    repository.update.mockResolvedValue(
      mockOrganizationReadModel({ name: 'Updated' }),
    );

    await useCase.execute('org-1', { name: 'Updated' });

    expect(repository.update).toHaveBeenCalledWith('org-1', {
      name: 'Updated',
    });
  });

  it('returns the updated organization read model', async () => {
    const expected = mockOrganizationReadModel({ name: 'Updated' });
    repository.update.mockResolvedValue(expected);

    const result = await useCase.execute('org-1', { name: 'Updated' });

    expect(result).toBe(expected);
  });

  it('throws OrganizationNotFoundException when repository returns null', async () => {
    repository.update.mockResolvedValue(null);

    await expect(useCase.execute('org-999', { name: 'Ghost' })).rejects.toThrow(
      OrganizationNotFoundException,
    );
  });

  it('throws with correct message when not found', async () => {
    repository.update.mockResolvedValue(null);

    await expect(useCase.execute('org-999', { name: 'Ghost' })).rejects.toThrow(
      'org-999',
    );
  });

  it('passes partial update (only description)', async () => {
    repository.update.mockResolvedValue(
      mockOrganizationReadModel({ description: 'New desc' }),
    );

    await useCase.execute('org-1', { description: 'New desc' });

    expect(repository.update).toHaveBeenCalledWith('org-1', {
      description: 'New desc',
    });
  });
});
