import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsDueDateAfterStartDate } from './create-task.dto';
import { IsDateString, IsOptional, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';
import { CreateTaskDto } from './create-task.dto';

/**
 * UpdateTaskDto extends PartialType(CreateTaskDto) so all create fields become
 * optional. We explicitly override startDate and dueDate to additionally allow
 * `null` (to clear the field) — which PartialType alone does not expose.
 */
export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  /**
   * WHY this pattern exists — do not simplify without reading this:
   *
   * `@IsOptional()` in class-validator treats both `undefined` AND `null` as
   * "skip validation", but it does NOT strip `null` from the object. We rely
   * on the value reaching Prisma as `null` so it sets the column to NULL.
   *
   * `@ValidateIf((_, v) => v !== null)` re-adds the `@IsDateString()` check
   * only when the value is a non-null string — letting explicit `null` pass
   * through cleanly without a validation error.
   *
   * Removing either decorator WILL break something:
   * - Remove `@IsOptional()`     → null is rejected at validation before reaching service
   * - Remove `@ValidateIf(...)`  → @IsDateString() rejects null with a type error
   */
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    format: 'date-time',
    description: 'Set to null to clear the start date',
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsDateString()
  @Transform(({ value }) => (value === null ? null : value))
  declare startDate?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    format: 'date-time',
    description: 'Set to null to clear the due date',
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsDateString()
  @IsDueDateAfterStartDate()
  @Transform(({ value }) => (value === null ? null : value))
  declare dueDate?: string | null;
}
