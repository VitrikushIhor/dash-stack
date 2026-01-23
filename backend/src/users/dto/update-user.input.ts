import { IsOptional } from 'class-validator';

export class UpdateUserInput {
  @IsOptional()
  firstname?: string;

  @IsOptional()
  lastname?: string;
}
