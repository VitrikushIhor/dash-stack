import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationRepository } from '../repositories/organization.repository';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(private readonly repository: OrganizationRepository) {}

  async create(userId: string, dto: CreateOrganizationDto) {
    const org = await this.repository.create(userId, dto);
    return this.mapOrganization(org);
  }

  async findAllForUser(userId: string) {
    const orgs = await this.repository.findAllForUser(userId);
    return orgs.map((org) => this.mapOrganization(org));
  }

  async findById(orgId: string) {
    const org = await this.repository.findById(orgId);
    if (!org) {
      throw new NotFoundException(`Organization with ID ${orgId} not found`);
    }
    return this.mapOrganization(org);
  }

  async update(orgId: string, dto: UpdateOrganizationDto) {
    const org = await this.repository.update(orgId, dto);
    return this.mapOrganization(org);
  }

  async delete(orgId: string) {
    return this.repository.delete(orgId);
  }

  async findMembers(orgId: string) {
    return this.repository.findMembers(orgId);
  }

  async findMember(orgId: string, userId: string) {
    const membership = await this.repository.findMember(orgId, userId);
    if (!membership) {
      throw new NotFoundException(
        `Member with user ID ${userId} not found in organization ${orgId}`,
      );
    }
    return membership;
  }

  private mapOrganization(org: any) {
    if (!org) return null;
    const { _count, ...rest } = org;
    return {
      ...rest,
      stats: _count
        ? {
            members: _count.memberships,
            projects: _count.projects,
            events: _count.calendarEvents,
          }
        : undefined,
    };
  }
}
