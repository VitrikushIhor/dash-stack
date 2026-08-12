import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { LabelRepositoryPort } from '../../application/ports/label.repository.port';
import { LABEL_ERRORS } from '../../domain/constants/label-errors';

@Injectable()
export class CreateLabelUseCase {
  constructor(
    @Inject('LabelRepositoryPort')
    private readonly labelRepository: LabelRepositoryPort,
  ) {}

  async execute(organizationId: string, data: { name: string; color: string }) {
    const existingLabel = await this.labelRepository.findByName(
      data.name,
      organizationId,
    );

    if (existingLabel) {
      throw new ConflictException(LABEL_ERRORS.ALREADY_EXISTS(data.name));
    }

    return this.labelRepository.create({
      organizationId,
      ...data,
    });
  }
}
