import { validate } from 'class-validator';
import { OrgRole } from '../../../../organization/domain/enums/org-role.enum';
import { CreateInvitationDto } from '../../../presentation/dto/create-invitation.dto';

describe('CreateInvitationDto', () => {
  it('should_reject_request_when_role_is_owner', async () => {
    const dto = new CreateInvitationDto();

    dto.email = 'owner@example.com';
    dto.role = OrgRole.OWNER;

    const errors = await validate(dto);

    expect(errors).toEqual(expect.arrayContaining([expect.objectContaining({ property: 'role' })]));
  });

  it('should_accept_request_when_role_is_admin', async () => {
    const dto = new CreateInvitationDto();

    dto.email = 'admin@example.com';
    dto.role = OrgRole.ADMIN;

    await expect(validate(dto)).resolves.toEqual([]);
  });
});
