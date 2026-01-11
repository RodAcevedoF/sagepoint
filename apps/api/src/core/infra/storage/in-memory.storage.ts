import type { IFileStorage } from '@/core/ports/file-storage.port';

export class InMemoryFileStorage implements IFileStorage {
  private files: Map<string, Buffer> = new Map();

  async upload(
    file: Buffer,
    mimeType: string,
    path: string,
  ): Promise<string> {
    this.files.set(path, file);
    // In a real S3, this would return a https://s3... URL
    // For local dev, we pretend it's served locally
    return `local://${path}`;
  }

  async delete(path: string): Promise<void> {
    this.files.delete(path);
  }
  
  // Helper for testing
  getFile(path: string): Buffer | undefined {
    return this.files.get(path);
  }
}
