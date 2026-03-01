import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class UpdateAdminUserDto {
  @IsOptional()
  @IsEnum(['ADMIN', 'USER'], { message: 'Role must be ADMIN or USER' })
  role?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
