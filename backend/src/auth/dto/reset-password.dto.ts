import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'd0e6504a-1150-48e0-94d7-a570077c5982',
    description: 'Password reset token from email',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    example: 'newpassword123',
    description: 'New password',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}
