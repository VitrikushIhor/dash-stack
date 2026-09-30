import { validate } from 'class-validator';
import { AcceptInvitationDto } from '../../../presentation/dto/accept-invitation.dto';

describe('AcceptInvitationDto', () => {
  it('should_accept_opaque_256_bit_invitation_token', async () => {
    const dto = new AcceptInvitationDto();
    dto.token = 'a'.repeat(43);

    await expect(validate(dto)).resolves.toEqual([]);
  });

  it.each(['short', '../other', 'a'.repeat(44)])(
    'should_reject_malformed_invitation_token',
    async (token) => {
      const dto = new AcceptInvitationDto();
      dto.token = token;

      const errors = await validate(dto);
      expect(errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ property: 'token' })]),
      );
    },
  );
});
