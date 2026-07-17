import { OrganizationSlugService } from '../../../application/services/organization-slug.service';
import { OrganizationRepositoryPort } from '../../../application/ports/organization.port';

describe('OrganizationSlugService', () => {
  let service: OrganizationSlugService;
  let repository: jest.Mocked<Pick<OrganizationRepositoryPort, 'existsBySlug'>>;

  beforeEach(() => {
    repository = {
      existsBySlug: jest.fn(),
    };

    service = new OrganizationSlugService(
      repository as unknown as OrganizationRepositoryPort,
    );
  });

  describe('generateUnique()', () => {
    it('returns base slug when it does not exist', async () => {
      repository.existsBySlug.mockResolvedValue(false);

      const result = await service.generateUnique('Acme Corp');

      expect(result).toBe('acme-corp');
      expect(repository.existsBySlug).toHaveBeenCalledTimes(1);
      expect(repository.existsBySlug).toHaveBeenCalledWith('acme-corp');
    });

    it('appends suffix when base slug exists', async () => {
      repository.existsBySlug
        .mockResolvedValueOnce(true) // 'acme-corp' exists
        .mockResolvedValueOnce(false); // 'acme-corp-1' is free

      const result = await service.generateUnique('Acme Corp');

      expect(result).toBe('acme-corp-1');
      expect(repository.existsBySlug).toHaveBeenCalledTimes(2);
    });

    it('increments suffix until free slug is found', async () => {
      repository.existsBySlug
        .mockResolvedValueOnce(true) // 'acme' exists
        .mockResolvedValueOnce(true) // 'acme-1' exists
        .mockResolvedValueOnce(true) // 'acme-2' exists
        .mockResolvedValueOnce(false); // 'acme-3' is free

      const result = await service.generateUnique('Acme');

      expect(result).toBe('acme-3');
      expect(repository.existsBySlug).toHaveBeenCalledTimes(4);
    });

    it('calls existsBySlug with correct slug on first attempt', async () => {
      repository.existsBySlug.mockResolvedValue(false);

      await service.generateUnique('My Organization');

      expect(repository.existsBySlug).toHaveBeenCalledWith('my-organization');
    });
  });
});
