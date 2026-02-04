import { IFileStorage, UploadOptions } from '@sagepoint/domain';
import * as fs from 'fs/promises';
import * as path from 'path';

export class LocalDiskStorage implements IFileStorage {
  private readonly baseUrl: string;

  constructor(
    private readonly uploadDir: string,
    baseUrl?: string,
  ) {
    // Default to localhost for local development
    this.baseUrl = baseUrl || process.env.APP_URL || 'http://localhost:3001';
  }

  async onModuleInit() {
    await fs.mkdir(this.uploadDir, { recursive: true });
  }

  async upload(
    storagePath: string,
    content: Buffer,
    mimeType: string,
    options?: UploadOptions,
  ): Promise<string> {
    const fullPath = path.join(this.uploadDir, storagePath);
    const dir = path.dirname(fullPath);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, content);

    // If public, return full URL
    if (options?.isPublic) {
      return `${this.baseUrl}/uploads/${storagePath}`;
    }

    return storagePath;
  }

  async download(storagePath: string): Promise<Buffer> {
    const fullPath = path.join(this.uploadDir, storagePath);
    return await fs.readFile(fullPath);
  }

  async delete(storagePath: string): Promise<void> {
    const fullPath = path.join(this.uploadDir, storagePath);
    try {
      await fs.unlink(fullPath);
    } catch {
      // Ignore if file not found
    }
  }

  async getUrl(storagePath: string, _expiresInSeconds?: number): Promise<string> {
    // Local storage doesn't support signed URLs, just return the path
    return `${this.baseUrl}/uploads/${storagePath}`;
  }
}
