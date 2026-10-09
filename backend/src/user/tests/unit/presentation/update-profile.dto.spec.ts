import { validate } from 'class-validator';
import { UpdateProfileDto } from '../../../presentation/dto/update-profile.dto';

describe('UpdateProfileDto', () => {
  it('should reject email changes', async () => {
    const dto = new UpdateProfileDto();
    dto.email = 'changed@example.com';

    const errors = await validate(dto);

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: 'email',
          constraints: expect.objectContaining({
            isEmpty: 'Email cannot be changed through profile updates.',
          }),
        }),
      ]),
    );
  });
});
