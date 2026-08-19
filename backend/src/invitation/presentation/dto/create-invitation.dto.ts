import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { OrgRole } from '../../../organization/domain/enums/org-role.enum';

export class CreateInvitationDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(OrgRole)
  role: OrgRole = OrgRole.MEMBER;
}
