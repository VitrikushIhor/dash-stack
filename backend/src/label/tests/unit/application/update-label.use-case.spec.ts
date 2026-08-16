import { UpdateLabelUseCase } from '../../../application/use-cases/update-label.use-case';
import { LabelRepositoryPort } from '../../../application/ports/label.repository.port';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { LABEL_ERRORS } from '../../../domain/constants/label-errors';

describe('UpdateLabelUseCase', () => {
  let useCase: UpdateLabelUseCase;
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
    useCase = new UpdateLabelUseCase(labelRepository);
  });

  it('updates a label successfully', async () => {
    // Arrange
    const organizationId = 'org-1';
    const labelId = 'label-1';
    const command = {
      name: 'Critical Bug',
      color: '#ff0000',
    };

    const existingLabel = {
      id: labelId,
      organizationId,
      name: 'Bug',
      color: '#ff0000',
    };

    const updatedLabel = {
      id: labelId,
      organizationId,
      name: 'Critical Bug',
      color: '#ff0000',
    };

    labelRepository.findById.mockResolvedValue(existingLabel);
    labelRepository.findByName.mockResolvedValue(null);
    labelRepository.update.mockResolvedValue(updatedLabel);

    // Act
    const result = await useCase.execute(labelId, organizationId, command);

    // Assert
    expect(result).toEqual(updatedLabel);
    expect(labelRepository.findById).toHaveBeenCalledWith(
      labelId,
      organizationId,
    );
    expect(labelRepository.findByName).toHaveBeenCalledWith(
      'Critical Bug',
      organizationId,
    );
    expect(labelRepository.update).toHaveBeenCalledWith(
      labelId,
      organizationId,
      command,
    );
  });

  it('updates only the color successfully without checking name uniqueness', async () => {
    // Arrange
    const organizationId = 'org-1';
    const labelId = 'label-1';
    const command = {
      color: '#00ff00', // only updating color
    };

    const existingLabel = {
      id: labelId,
      organizationId,
      name: 'Bug',
      color: '#ff0000',
    };

    const updatedLabel = {
      ...existingLabel,
      color: '#00ff00',
    };

    labelRepository.findById.mockResolvedValue(existingLabel);
    labelRepository.update.mockResolvedValue(updatedLabel);

    // Act
    const result = await useCase.execute(labelId, organizationId, command);

    // Assert
    expect(result).toEqual(updatedLabel);
    expect(labelRepository.findById).toHaveBeenCalledWith(
      labelId,
      organizationId,
    );
    expect(labelRepository.findByName).not.toHaveBeenCalled(); // No name check if name wasn't provided
    expect(labelRepository.update).toHaveBeenCalledWith(
      labelId,
      organizationId,
      command,
    );
  });

  it('throws NotFoundException if the label does not exist', async () => {
    // Arrange
    const organizationId = 'org-1';
    const labelId = 'non-existent';

    labelRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(labelId, organizationId, {})).rejects.toThrow(
      new NotFoundException(LABEL_ERRORS.NOT_FOUND),
    );

    expect(labelRepository.findById).toHaveBeenCalledWith(
      labelId,
      organizationId,
    );
    expect(labelRepository.update).not.toHaveBeenCalled();
  });

  it('throws ConflictException if the new name is already taken by another label', async () => {
    // Arrange
    const organizationId = 'org-1';
    const labelId = 'label-1';
    const command = {
      name: 'Feature',
    };

    const existingLabel = {
      id: labelId,
      organizationId,
      name: 'Bug',
      color: '#ff0000',
    };

    labelRepository.findById.mockResolvedValue(existingLabel);
    labelRepository.findByName.mockResolvedValue({
      id: 'another-label', // Different ID
      organizationId,
      name: 'Feature',
      color: '#0000ff',
    });

    // Act & Assert
    await expect(
      useCase.execute(labelId, organizationId, command),
    ).rejects.toThrow(
      new ConflictException(LABEL_ERRORS.ALREADY_EXISTS('Feature')),
    );

    expect(labelRepository.update).not.toHaveBeenCalled();
  });

  it('does not throw ConflictException if the new name belongs to the label being updated', async () => {
    // Arrange
    const organizationId = 'org-1';
    const labelId = 'label-1';
    const command = {
      name: 'Bug',
      color: '#00ff00', // same name, different color
    };

    const existingLabel = {
      id: labelId,
      organizationId,
      name: 'Bug',
      color: '#ff0000',
    };

    labelRepository.findById.mockResolvedValue(existingLabel);
    // findByName returns the same label we are trying to update
    labelRepository.findByName.mockResolvedValue(existingLabel);

    labelRepository.update.mockResolvedValue({
      ...existingLabel,
      color: '#00ff00',
    });

    // Act
    await useCase.execute(labelId, organizationId, command);

    // Assert
    expect(labelRepository.update).toHaveBeenCalledWith(
      labelId,
      organizationId,
      command,
    );
  });
});
