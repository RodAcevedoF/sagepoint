import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetAdminDocumentsDto {
  @IsOptional()
  @IsEnum(['UPLOADED', 'PARSING', 'ANALYZING', 'SUMMARIZED', 'READY'], {
    message: 'Stage must be UPLOADED, PARSING, ANALYZING, SUMMARIZED, or READY',
  })
  stage?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
