import { Inject, Injectable } from '@nestjs/common';
import { LabelRepositoryPort } from '../../../label/application/ports/label.repository.port';
import { InvalidTaskLabelException } from '../../domain/exceptions/invalid-task-label.exception';

@Injectable()
export class TaskLabelValidatorService {
  constructor(
    @Inject('LabelRepositoryPort')
    private readonly labelRepository: LabelRepositoryPort,
  ) {}

  async validateOrThrow(organizationId: string, labelId?: string | null): Promise<void> {
    if (labelId === undefined || labelId === null) {
      return;
    }

    const label = await this.labelRepository.findById(labelId, organizationId);
    if (!label) {
      throw new InvalidTaskLabelException();
    }
  }
}
