import { Module } from '@nestjs/common';

import { LabelController } from './presentation/label.controller';
import { CreateLabelUseCase } from './application/use-cases/create-label.use-case';
import { UpdateLabelUseCase } from './application/use-cases/update-label.use-case';
import { DeleteLabelUseCase } from './application/use-cases/delete-label.use-case';
import { FindAllLabelsUseCase } from './application/use-cases/find-all-labels.use-case';
import { PrismaLabelRepository } from './infrastructure/persistence/prisma-label.repository';

@Module({
  controllers: [LabelController],
  providers: [
    CreateLabelUseCase,
    UpdateLabelUseCase,
    DeleteLabelUseCase,
    FindAllLabelsUseCase,
    {
      provide: 'LabelRepositoryPort',
      useClass: PrismaLabelRepository,
    },
  ],
  exports: ['LabelRepositoryPort'],
})
export class LabelModule {}
