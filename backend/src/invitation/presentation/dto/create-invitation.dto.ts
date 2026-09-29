import { IsEmail, IsIn, IsOptional } from 'class-validator';
import { OrgRole } from '../../../organization/domain/enums/org-role.enum';

export class CreateInvitationDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsIn([OrgRole.ADMIN, OrgRole.MEMBER, OrgRole.GUEST])
  role: OrgRole = OrgRole.MEMBER;
}
