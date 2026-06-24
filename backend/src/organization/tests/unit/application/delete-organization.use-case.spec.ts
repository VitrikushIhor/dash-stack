import { DeleteOrganizationUseCase } from '../../../application/use-cases/delete-organization.use-case';
import { OrganizationRepositoryPort } from '../../../application/ports/organization.port';

describe('DeleteOrganizationUseCase', () => {
  let useCase: DeleteOrganizationUseCase;
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

    useCase = new DeleteOrganizationUseCase(repository);
  });

  it('calls repository.delete with correct orgId', async () => {
    repository.delete.mockResolvedValue(undefined);

    await useCase.execute('org-1');

    expect(repository.delete).toHaveBeenCalledWith('org-1');
    expect(repository.delete).toHaveBeenCalledTimes(1);
  });

  it('returns success message', async () => {
    repository.delete.mockResolvedValue(undefined);

    const result = await useCase.execute('org-1');

    expect(result).toEqual({ message: 'Organization deleted successfully' });
  });

  it('propagates error thrown by repository (e.g. Prisma P2025 not found)', async () => {
    const prismaError = new Error('Record to delete does not exist');
    repository.delete.mockRejectedValue(prismaError);

    await expect(useCase.execute('org-999')).rejects.toThrow(
      'Record to delete does not exist',
    );
  });
});
