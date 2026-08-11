import { DeleteLabelUseCase } from '../../../application/use-cases/delete-label.use-case';
import { LabelRepositoryPort } from '../../../application/ports/label.repository.port';
import { NotFoundException } from '@nestjs/common';
import { LABEL_ERRORS } from '../../../domain/constants/label-errors';

describe('DeleteLabelUseCase', () => {
  let useCase: DeleteLabelUseCase;
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
    useCase = new DeleteLabelUseCase(labelRepository);
  });

  it('deletes a label successfully', async () => {
    // Arrange
    const organizationId = 'org-1';
    const labelId = 'label-1';

    labelRepository.findById.mockResolvedValue({
      id: labelId,
      organizationId,
      name: 'Bug',
      color: '#ff0000',
    });
    labelRepository.delete.mockResolvedValue(undefined);

    // Act
    await useCase.execute(organizationId, labelId);

    // Assert
    expect(labelRepository.findById).toHaveBeenCalledWith(
      organizationId,
      labelId,
    );
    expect(labelRepository.delete).toHaveBeenCalledWith(
      organizationId,
      labelId,
    );
  });

  it('throws NotFoundException if the label does not exist', async () => {
    // Arrange
    const organizationId = 'org-1';
    const labelId = 'non-existent';

    labelRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(organizationId, labelId)).rejects.toThrow(
      new NotFoundException(LABEL_ERRORS.NOT_FOUND),
    );

    expect(labelRepository.findById).toHaveBeenCalledWith(
      organizationId,
      labelId,
    );
    expect(labelRepository.delete).not.toHaveBeenCalled();
  });
});
