import { FindAllLabelsUseCase } from '../../../application/use-cases/find-all-labels.use-case';
import { LabelRepositoryPort } from '../../../application/ports/label.repository.port';

describe('FindAllLabelsUseCase', () => {
  let useCase: FindAllLabelsUseCase;
  let labelRepository: jest.Mocked<LabelRepositoryPort>;

  beforeEach(() => {
    labelRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new FindAllLabelsUseCase(labelRepository);
  });

  it('returns a list of labels', async () => {
    // Arrange
    const organizationId = 'org-1';
    const mockLabels = [
      { id: '1', organizationId, name: 'Bug', color: '#ff0000' },
      { id: '2', organizationId, name: 'Feature', color: '#00ff00' },
    ];

    labelRepository.findAll.mockResolvedValue(mockLabels);

    // Act
    const result = await useCase.execute(organizationId);

    // Assert
    expect(result).toEqual(mockLabels);
    expect(labelRepository.findAll).toHaveBeenCalledWith(organizationId);
  });

  it('returns an empty array if no labels exist', async () => {
    // Arrange
    const organizationId = 'org-2';
    labelRepository.findAll.mockResolvedValue([]);

    // Act
    const result = await useCase.execute(organizationId);

    // Assert
    expect(result).toEqual([]);
    expect(labelRepository.findAll).toHaveBeenCalledWith(organizationId);
  });
});
