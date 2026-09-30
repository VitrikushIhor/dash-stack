import { LabelRepositoryPort } from '../../../../label/application/ports/label.repository.port';
import { TaskLabelValidatorService } from '../../../application/services/task-label-validator.service';
import { InvalidTaskLabelException } from '../../../domain/exceptions/invalid-task-label.exception';

describe('TaskLabelValidatorService', () => {
  let labelRepository: jest.Mocked<LabelRepositoryPort>;
  let service: TaskLabelValidatorService;

  beforeEach(() => {
    labelRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    service = new TaskLabelValidatorService(labelRepository);
  });

  it('should reject a label from another organization', async () => {
    labelRepository.findById.mockResolvedValue(null);

    await expect(service.validateOrThrow('org-1', 'foreign-label')).rejects.toThrow(
      InvalidTaskLabelException,
    );
    expect(labelRepository.findById).toHaveBeenCalledWith('foreign-label', 'org-1');
  });

  it('should allow clearing a task label without a lookup', async () => {
    await service.validateOrThrow('org-1', null);

    expect(labelRepository.findById).not.toHaveBeenCalled();
  });
});
