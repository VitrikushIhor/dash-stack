import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { ExportFormat } from '../../application/contracts/export-flashcards.contract';

const exportFormats = [ExportFormat.CSV, ExportFormat.JSON] as const;

export class ExportFlashcardsQueryDto {
  @ApiProperty({ enum: exportFormats })
  @IsIn(exportFormats)
  format: (typeof exportFormats)[number];
}
