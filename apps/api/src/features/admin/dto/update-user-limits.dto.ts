import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserLimitsDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  maxDocuments?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  maxRoadmaps?: number | null;
}
