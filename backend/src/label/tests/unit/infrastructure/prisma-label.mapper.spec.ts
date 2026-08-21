import { PrismaLabelMapper } from '../../../infrastructure/persistence/prisma-label.mapper';
import { OrganizationLabel } from '@prisma/client';

describe('PrismaLabelMapper', () => {
  describe('toDomain', () => {
    it('should map Prisma OrganizationLabel to Domain LabelReadModel', () => {
      // Arrange
      const rawPrismaLabel: OrganizationLabel = {
        id: 'label-1',
        organizationId: 'org-1',
        name: 'Urgent',
        color: '#ff0000',
      };

      // Act
      const result = PrismaLabelMapper.toDomain(rawPrismaLabel);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.id).toBe('label-1');
      expect(result?.organizationId).toBe('org-1');
      expect(result?.name).toBe('Urgent');
      expect(result?.color).toBe('#ff0000');
    });

    it('should handle null color correctly by defaulting to a fallback color', () => {
      // Arrange
      const rawPrismaLabel: OrganizationLabel = {
        id: 'label-1',
        organizationId: 'org-1',
        name: 'No Color',
        color: null,
      };

      // Act
      const result = PrismaLabelMapper.toDomain(rawPrismaLabel);

      // Assert
      expect(result?.color).toBe('gray');
    });

    it('should return null when passed null', () => {
      // Arrange
      const rawPrismaLabel = null;

      // Act
      const result = PrismaLabelMapper.toDomain(rawPrismaLabel);

      // Assert
      expect(result).toBeNull();
    });
  });
});
