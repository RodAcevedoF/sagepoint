import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MinLength,
} from 'class-validator';

enum UserRoleDto {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export class CreateUserDirectDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  name!: string;

  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsEnum(UserRoleDto)
  role?: string;
}
