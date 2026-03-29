import {
  IsString,
  IsOptional,
  IsUrl,
  IsArray,
  ArrayMaxSize,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  learningGoal?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  interests?: string[];
}
