import { Injectable, Inject } from '@nestjs/common';
import { LabelRepositoryPort } from '../../application/ports/label.repository.port';

@Injectable()
export class FindAllLabelsUseCase {
  constructor(
    @Inject('LabelRepositoryPort')
    private readonly labelRepository: LabelRepositoryPort,
  ) {}

  async execute(organizationId: string) {
    return this.labelRepository.findAll(organizationId);
  }
}
