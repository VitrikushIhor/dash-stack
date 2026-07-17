import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    example: 'd0e6504a-1150-48e0-94d7-a570077c5982',
    description: 'Verification token from email',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
