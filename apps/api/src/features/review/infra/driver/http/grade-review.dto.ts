import { IsInt, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GradeReviewDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(5)
  quality!: number;
}
