import {
  IsString,
  IsOptional,
  IsInt,
  IsIn,
  MinLength,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class UserContextDto {
  @IsOptional()
  @IsString()
  @MaxLength(280)
  goal?: string;

  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'advanced', 'expert'])
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';

  @IsOptional()
  @IsInt()
  @Min(0)
  timeAvailable?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  preferredLearningStyle?: string;
}

export class GenerateTopicRoadmapDto {
  @IsString()
  @MinLength(2)
  @MaxLength(280)
  topic!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserContextDto)
  userContext?: UserContextDto;
}
