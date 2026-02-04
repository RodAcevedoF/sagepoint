import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import type { FileCategory } from '../../domain/inbound/storage.service';

export class UploadFileDto {
  @IsEnum(['avatars', 'documents', 'roadmaps', 'temp'])
  category: FileCategory;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
