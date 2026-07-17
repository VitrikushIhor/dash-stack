import { Inject, Injectable } from '@nestjs/common';
import { OrganizationRepositoryPort } from '../ports/organization.port';
import { UserMembershipReadModel } from '../../../user/application/read-models/user-membership.read-model';

@Injectable()
export class FindUserMembershipsUseCase {
  constructor(
    @Inject('OrganizationRepositoryPort')
    private readonly organizationRepository: OrganizationRepositoryPort,
  ) {}

  async execute(userId: string): Promise<UserMembershipReadModel[]> {
    return this.organizationRepository.findUserMemberships(userId);
  }
}
