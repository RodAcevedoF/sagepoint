import { BadRequestException } from '@nestjs/common';
import { IFileStorage } from '@sagepoint/domain';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import {
  UploadFileInput,
  UploadResult,
  FileCategory,
} from '../../domain/inbound/storage.service';

const ALLOWED_MIME_TYPES: Record<FileCategory, string[]> = {
  avatars: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/markdown',
  ],
  roadmaps: ['image/jpeg', 'image/png', 'image/webp', 'application/json'],
  temp: [], // Allow all for temp
};

const MAX_FILE_SIZES: Record<FileCategory, number> = {
  avatars: 5 * 1024 * 1024, // 5MB
  documents: 50 * 1024 * 1024, // 50MB
  roadmaps: 10 * 1024 * 1024, // 10MB
  temp: 100 * 1024 * 1024, // 100MB
};

export class UploadFileUseCase {
  constructor(private readonly fileStorage: IFileStorage) {}

  async execute(input: UploadFileInput): Promise<UploadResult> {
    // Validate MIME type
    const allowedTypes = ALLOWED_MIME_TYPES[input.category];
    if (allowedTypes.length > 0 && !allowedTypes.includes(input.mimeType)) {
      throw new BadRequestException(
        `File type ${input.mimeType} not allowed for ${input.category}`,
      );
    }

    // Validate file size
    const maxSize = MAX_FILE_SIZES[input.category];
    if (input.content.length > maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed (${maxSize / 1024 / 1024}MB) for ${input.category}`,
      );
    }

    // Generate storage path
    const ext =
      path.extname(input.filename) || this.getExtFromMime(input.mimeType);
    const uniqueId = uuidv4();
    const storagePath = input.userId
      ? `${input.category}/${input.userId}/${uniqueId}${ext}`
      : `${input.category}/${uniqueId}${ext}`;

    // Upload to storage
    const result = await this.fileStorage.upload(
      storagePath,
      input.content,
      input.mimeType,
      { isPublic: input.isPublic },
    );

    return {
      path: storagePath,
      url: input.isPublic ? result : undefined,
    };
  }

  private getExtFromMime(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'application/pdf': '.pdf',
      'application/json': '.json',
      'text/plain': '.txt',
      'text/markdown': '.md',
    };
    return mimeToExt[mimeType] || '';
  }
}
