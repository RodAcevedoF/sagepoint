import { IsEmail, IsOptional, IsEnum } from 'class-validator';

enum UserRoleDto {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export class CreateInvitationDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsEnum(UserRoleDto)
  role?: string;
}
