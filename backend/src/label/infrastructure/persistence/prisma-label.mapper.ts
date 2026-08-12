import { OrganizationLabel } from '@prisma/client';
import { LabelReadModel } from '../../application/read-models/label.read-model';

export class PrismaLabelMapper {
  static toDomain(
    prismaLabel: OrganizationLabel | null,
  ): LabelReadModel | null {
    if (!prismaLabel) {
      return null;
    }

    return {
      id: prismaLabel.id,
      name: prismaLabel.name,
      color: prismaLabel.color ?? 'gray',
      organizationId: prismaLabel.organizationId,
    };
  }
}
