import { Inject, Injectable } from '@nestjs/common';
import { MembershipRepositoryPort } from '../ports/membership.repository.port';
import { InvalidAssigneesException } from '../../domain/exceptions/invalid-assignees.exception';

@Injectable()
export class TaskAssigneeValidatorService {
  constructor(
    @Inject('MembershipRepositoryPort')
    private readonly membershipRepository: MembershipRepositoryPort,
  ) {}

  async validateOrThrow(
    organizationId: string,
    assigneeIds?: string[],
  ): Promise<void> {
    if (!assigneeIds?.length) return;

    const isValid = await this.membershipRepository.validateMemberships(
      organizationId,
      assigneeIds,
    );

    if (!isValid) {
      throw new InvalidAssigneesException();
    }
  }
}
