import { MulterFile } from 'src/common/interfaces/multer-file.interface';

export interface UploadOptions {
  fileName: string;
  folder?: string;
  bucket: string;
  bucketType?: 'public' | 'private';
}

export interface UploadResult {
  fileKey: string;
  url: string;
  size: number;
  mimeType: string;
  originalName: string;
  bucketType: 'public' | 'private';
  uploadedAt: Date;
}

export interface IStorageProvider {
  uploadFile(file: MulterFile, options: UploadOptions): Promise<UploadResult>;
  getSignedFileUrl(
    fileKey: string,
    bucket: string,
    expiresIn?: number,
  ): Promise<string>;
  getPublicFileUrl(fileKey: string, bucket: string): string;
  deleteFile(fileKey: string, bucket: string): Promise<void>;
}
