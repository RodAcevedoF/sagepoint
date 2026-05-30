import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ReviewSource } from '@sagepoint/domain';

export class GetDueQueryDto {
  @IsOptional()
  @IsEnum(ReviewSource)
  source?: ReviewSource;

  @IsOptional()
  @IsString()
  sourceId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}

export class CountDueQueryDto {
  @IsOptional()
  @IsEnum(ReviewSource)
  source?: ReviewSource;

  @IsOptional()
  @IsString()
  sourceId?: string;
}
