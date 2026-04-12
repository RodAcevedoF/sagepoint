import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserLimitsDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  balance?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  credit?: number;
}
