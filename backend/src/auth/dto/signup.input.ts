import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class SignupInput {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsOptional()
  firstname?: string;

  @IsOptional()
  lastname?: string;
}
