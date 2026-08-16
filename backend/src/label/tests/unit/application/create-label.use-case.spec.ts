import { CreateLabelUseCase } from '../../../application/use-cases/create-label.use-case';
import { LabelRepositoryPort } from '../../../application/ports/label.repository.port';
import { ConflictException } from '@nestjs/common';
import { LABEL_ERRORS } from '../../../domain/constants/label-errors';

describe('CreateLabelUseCase', () => {
  let useCase: CreateLabelUseCase;
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
    useCase = new CreateLabelUseCase(labelRepository);
  });

  it('creates a new label successfully when the name is unique', async () => {
    // Arrange
    const organizationId = 'org-1';
    const command = {
      name: 'Bug',
      color: '#ff0000',
    };
    const expectedLabel = {
      id: 'label-1',
      organizationId,
      name: 'Bug',
      color: '#ff0000',
    };

    labelRepository.findByName.mockResolvedValue(null);
    labelRepository.create.mockResolvedValue(expectedLabel);

    // Act
    const result = await useCase.execute(organizationId, command);

    // Assert
    expect(result).toEqual(expectedLabel);
    expect(labelRepository.findByName).toHaveBeenCalledWith('Bug', organizationId);
    expect(labelRepository.create).toHaveBeenCalledWith({
      organizationId,
      ...command,
    });
  });

  it('throws ConflictException when a label with the same name already exists', async () => {
    // Arrange
    const organizationId = 'org-1';
    const command = {
      name: 'Bug',
      color: '#00ff00',
    };

    // Simulate that a label with this name already exists
    labelRepository.findByName.mockResolvedValue({
      id: 'existing-label-id',
      organizationId,
      name: 'Bug',
      color: '#ff0000',
    });

    // Act & Assert
    await expect(useCase.execute(organizationId, command)).rejects.toThrow(
      new ConflictException(LABEL_ERRORS.ALREADY_EXISTS('Bug')),
    );

    expect(labelRepository.findByName).toHaveBeenCalledWith('Bug', organizationId);
    expect(labelRepository.create).not.toHaveBeenCalled();
  });
});
