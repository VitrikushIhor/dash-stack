import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  CreateLabelData,
  LabelRepositoryPort,
  UpdateLabelData,
} from '../../application/ports/label.repository.port';
import { LabelReadModel } from '../../application/read-models/label.read-model';
import { PrismaLabelMapper } from './prisma-label.mapper';
import { LABEL_ERRORS } from '../../domain/constants/label-errors';

@Injectable()
export class PrismaLabelRepository implements LabelRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateLabelData): Promise<LabelReadModel> {
    const createdLabel = await this.prisma.organizationLabel.create({
      data,
    });

    return PrismaLabelMapper.toDomain(createdLabel);
  }

  async findAll(organizationId: string): Promise<LabelReadModel[]> {
    const labels = await this.prisma.organizationLabel.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
    });

    return labels.map((label) => PrismaLabelMapper.toDomain(label));
  }

  async findById(id: string, organizationId: string): Promise<LabelReadModel | null> {
    const label = await this.prisma.organizationLabel.findFirst({
      where: { id, organizationId },
    });

    return label ? PrismaLabelMapper.toDomain(label) : null;
  }

  async findByName(name: string, organizationId: string): Promise<LabelReadModel | null> {
    const label = await this.prisma.organizationLabel.findFirst({
      where: { name, organizationId },
    });

    return label ? PrismaLabelMapper.toDomain(label) : null;
  }

  async update(id: string, organizationId: string, data: UpdateLabelData): Promise<LabelReadModel> {
    await this.prisma.organizationLabel.updateMany({
      where: { id, organizationId },
      data,
    });

    const updatedLabel = await this.prisma.organizationLabel.findFirst({
      where: { id, organizationId },
    });

    if (!updatedLabel) {
      throw new NotFoundException(LABEL_ERRORS.NOT_FOUND);
    }

    return PrismaLabelMapper.toDomain(updatedLabel);
  }

  async delete(id: string, organizationId: string): Promise<void> {
    await this.prisma.organizationLabel.deleteMany({
      where: { id, organizationId },
    });
  }
}
