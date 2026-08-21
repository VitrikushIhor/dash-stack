import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LabelRepositoryPort } from '../../application/ports/label.repository.port';
import { LABEL_ERRORS } from '../../domain/constants/label-errors';

@Injectable()
export class DeleteLabelUseCase {
  constructor(
    @Inject('LabelRepositoryPort')
    private readonly labelRepository: LabelRepositoryPort,
  ) {}

  async execute(id: string, organizationId: string) {
    const existingLabel = await this.labelRepository.findById(id, organizationId);

    if (!existingLabel) {
      throw new NotFoundException(LABEL_ERRORS.NOT_FOUND);
    }

    await this.labelRepository.delete(id, organizationId);
  }
}
