import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationRepository } from '../repositories/organization.repository';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(private readonly repository: OrganizationRepository) {}

  async create(userId: string, dto: CreateOrganizationDto) {
    return this.repository.create(userId, dto);
  }

  async findAllForUser(userId: string) {
    return this.repository.findAllForUser(userId);
  }

  async findById(orgId: string) {
    const org = await this.repository.findById(orgId);
    if (!org) {
      throw new NotFoundException(`Organization with ID ${orgId} not found`);
    }
    return org;
  }

  async update(orgId: string, dto: UpdateOrganizationDto) {
    return this.repository.update(orgId, dto);
  }

  async delete(orgId: string) {
    return this.repository.delete(orgId);
  }
}
