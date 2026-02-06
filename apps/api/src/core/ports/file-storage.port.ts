export interface IFileStorage {
  upload(file: Buffer, mimeType: string, path: string): Promise<string>; // Returns the public URL or internal path

  delete(path: string): Promise<void>;
}
