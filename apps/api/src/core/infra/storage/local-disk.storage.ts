import { IFileStorage } from '@sagepoint/domain';
import * as fs from 'fs/promises';
import * as path from 'path';


export class LocalDiskStorage implements IFileStorage {
  constructor(private readonly uploadDir: string) {}

  async onModuleInit() {
    await fs.mkdir(this.uploadDir, { recursive: true });
  }

  async upload(storagePath: string, content: Buffer, mimeType: string): Promise<string> {
    const fullPath = path.join(this.uploadDir, storagePath);
    const dir = path.dirname(fullPath);
    
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, content);
    
    return storagePath; // Return relative path as identifier
  }

  async download(storagePath: string): Promise<Buffer> {
    const fullPath = path.join(this.uploadDir, storagePath);
    return await fs.readFile(fullPath);
  }

  async delete(storagePath: string): Promise<void> {
    const fullPath = path.join(this.uploadDir, storagePath);
    try {
      await fs.unlink(fullPath);
    } catch (e) {
      // Ignore if file not found
    }
  }
}
