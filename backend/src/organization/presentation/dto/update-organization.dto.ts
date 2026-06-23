import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateOrganizationDto } from './create-organization.dto';
import { IsOptional, IsUrl } from 'class-validator';

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {
  @ApiPropertyOptional({ description: 'The URL of the organization logo' })
  @IsOptional()
  @IsUrl()
  logo?: string;
}
