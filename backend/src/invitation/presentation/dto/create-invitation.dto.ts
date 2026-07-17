import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { OrgRole } from '@prisma/client';

export class CreateInvitationDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(OrgRole)
  role: OrgRole = OrgRole.MEMBER;
}
