import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { LabelRepositoryPort } from '../../application/ports/label.repository.port';
import { LABEL_ERRORS } from '../../domain/constants/label-errors';

@Injectable()
export class UpdateLabelUseCase {
  constructor(
    @Inject('LabelRepositoryPort')
    private readonly labelRepository: LabelRepositoryPort,
  ) {}

  async execute(id: string, organizationId: string, data: { name?: string; color?: string }) {
    const existingLabel = await this.labelRepository.findById(id, organizationId);

    if (!existingLabel) {
      throw new NotFoundException(LABEL_ERRORS.NOT_FOUND);
    }

    if (data.name && data.name !== existingLabel.name) {
      const nameConflict = await this.labelRepository.findByName(data.name, organizationId);

      if (nameConflict) {
        throw new ConflictException(LABEL_ERRORS.ALREADY_EXISTS(data.name));
      }
    }

    return this.labelRepository.update(id, organizationId, data);
  }
}
