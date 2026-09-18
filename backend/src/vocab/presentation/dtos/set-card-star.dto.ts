import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export class SetCardStarDto {
  @ApiProperty({ description: 'Desired personal star state', type: Boolean })
  @Transform(({ obj }: { obj: unknown }) =>
    typeof obj === 'object' && obj !== null && 'isStarred' in obj ? obj.isStarred : undefined,
  )
  @IsBoolean()
  isStarred: boolean;
}
