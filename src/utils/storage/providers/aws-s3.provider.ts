import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import {
  IStorageProvider,
  UploadOptions,
  UploadResult,
} from '../interfaces/storage.interface';
import { ENV } from '../../config/env.enum';
import { MulterFile } from 'src/common/interfaces/multer-file.interface';
@Injectable()
export class AWSS3Provider implements IStorageProvider {
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: configService.get(ENV.AWS_REGION),
      credentials: {
        accessKeyId: configService.get(ENV.AWS_ACCESS_KEY_ID),
        secretAccessKey: configService.get(ENV.AWS_SECRET_ACCESS_KEY),
      },
      ...(configService.get(ENV.AWS_ENDPOINT) && {
        endpoint: configService.get(ENV.AWS_ENDPOINT),
        forcePathStyle: true, // Required for S3-compatible services
      }),
    });
  }

  async uploadFile(
    // @ts-ignore
    file: MulterFile,
    options: UploadOptions,
  ): Promise<UploadResult> {
    const bucket = options.bucket;
    const bucketType = options.bucketType || 'private';

    const key = options.folder
      ? `${options.folder}/${options.fileName}`
      : options.fileName;

    // Set ACL based on bucket type - public buckets get public-read, private get private
    const acl = bucketType === 'public' ? 'public-read' : 'private';

    const uploadParams: PutObjectCommandInput = {
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: acl,
      ServerSideEncryption: 'AES256', // Encrypt at rest
      Metadata: {
        originalName: file.originalname,
        uploadedBy: 'storage-service',
        uploadedAt: new Date().toISOString(),
        bucketType: bucketType,
      },
    };

    const command = new PutObjectCommand(uploadParams);
    await this.s3Client.send(command);

    // Generate URL based on bucket type
    const url =
      bucketType === 'public'
        ? this.getPublicFileUrl(key, bucket)
        : await this.getSignedFileUrl(key, bucket);

    return {
      fileKey: key,
      url,
      bucketType,
      size: file.size,
      mimeType: file.mimetype,
      originalName: file.originalname,
      uploadedAt: new Date(),
    };
  }

  async getSignedFileUrl(
    fileKey: string,
    bucket: string,
    expiresIn = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: fileKey,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  getPublicFileUrl(fileKey: string, bucket: string): string {
    const endpoint = this.configService.get(ENV.AWS_ENDPOINT);
    // Use the configured endpoint for public file URLs
    if (endpoint) {
      const endpointWithoutProtocol = endpoint
        .replace('https://', '')
        .replace('http://', '');
      return `https://${endpointWithoutProtocol}/${bucket}/${fileKey}`;
    }

    // Fallback to AWS S3 format if no endpoint is configured
    const region = this.configService.get(ENV.AWS_REGION);
    return `https://${bucket}.s3.${region}.amazonaws.com/${fileKey}`;
  }

  async deleteFile(fileKey: string, bucket: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: fileKey,
    });

    await this.s3Client.send(command);
  }

  // Generate a unique file name with extension preserved
  generateFileName(originalName: string): string {
    const extension = originalName.split('.').pop();
    return `${uuidv4()}.${extension}`;
  }
}
