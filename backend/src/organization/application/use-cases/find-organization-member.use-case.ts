import { Inject, Injectable } from '@nestjs/common';
import {
  OrganizationMember,
  OrganizationRepositoryPort,
} from '../ports/organization.port';
import { MemberNotFoundException } from '../../domain/exceptions/member-not-found.exception';

@Injectable()
export class FindOrganizationMemberUseCase {
  constructor(
    @Inject('OrganizationRepositoryPort')
    private readonly organizationRepository: OrganizationRepositoryPort,
  ) {}

  async execute(orgId: string, userId: string): Promise<OrganizationMember> {
    const member = await this.organizationRepository.findOrganizationMember(
      orgId,
      userId,
    );

    if (!member) {
      throw new MemberNotFoundException(orgId, userId);
    }

    return member;
  }
}
