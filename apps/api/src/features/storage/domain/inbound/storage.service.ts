export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');

export type FileCategory = 'avatars' | 'documents' | 'roadmaps' | 'temp';

export interface UploadFileInput {
  /** The file content */
  content: Buffer;
  /** Original filename */
  filename: string;
  /** MIME type */
  mimeType: string;
  /** Category determines the storage path prefix */
  category: FileCategory;
  /** Optional: Associate with a user ID (creates user-specific path) */
  userId?: string;
  /** Whether the file should be publicly accessible */
  isPublic?: boolean;
}

export interface UploadResult {
  /** The storage path/key */
  path: string;
  /** Public URL if isPublic was true, otherwise undefined */
  url?: string;
}

export interface IStorageService {
  /**
   * Upload a file to storage
   */
  upload(input: UploadFileInput): Promise<UploadResult>;

  /**
   * Get a URL for a file (signed URL for private files)
   */
  getUrl(path: string, expiresInSeconds?: number): Promise<string>;

  /**
   * Delete a file from storage
   */
  delete(path: string): Promise<void>;

  /**
   * Download a file
   */
  download(path: string): Promise<Buffer>;
}
