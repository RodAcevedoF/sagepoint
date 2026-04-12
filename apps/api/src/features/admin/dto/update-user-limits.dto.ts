import { IsInt, IsOptional, Min, ValidateIf } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateUserLimitsDto {
  @IsOptional()
  @ValidateIf((o) => o.balance !== null)
  @IsInt()
  @Min(0)
  @Transform(({ value }) => (value === null ? null : Number(value)))
  balance?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  credit?: number;
}
