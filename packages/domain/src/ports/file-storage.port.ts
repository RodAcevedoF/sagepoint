export const FILE_STORAGE = Symbol('FILE_STORAGE');

export interface UploadOptions {
  /** Make the file publicly accessible (default: false) */
  isPublic?: boolean;
  /** Custom metadata to attach to the file */
  metadata?: Record<string, string>;
}

export interface IFileStorage {
  /**
   * Uploads a file to the storage.
   * @param path The path/key where the file should be stored (e.g., "avatars/user-123.jpg")
   * @param content The file content as a buffer.
   * @param mimeType The MIME type of the file.
   * @param options Upload options (public access, metadata)
   * @returns The storage path or public URL if isPublic is true.
   */
  upload(path: string, content: Buffer, mimeType: string, options?: UploadOptions): Promise<string>;

  /**
   * Retrieves a file from storage.
   * @param path The path/key of the file.
   * @returns The file content as a buffer.
   */
  download(path: string): Promise<Buffer>;

  /**
   * Deletes a file from storage.
   * @param path The path/key of the file.
   */
  delete(path: string): Promise<void>;

  /**
   * Gets a public URL for a file. For private files, generates a signed URL.
   * @param path The path/key of the file.
   * @param expiresInSeconds How long the signed URL should be valid (default: 3600)
   * @returns The public or signed URL.
   */
  getUrl(path: string, expiresInSeconds?: number): Promise<string>;
}
