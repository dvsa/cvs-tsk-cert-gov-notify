/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable class-methods-use-this */
import { GetObjectCommandOutput, PutObjectCommandOutput } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';

interface IBucket {
  bucketName: string;
  files: string[];
}

/**
 * Service for mocking the S3BucketService
 */
class S3BucketMockService {
  public static buckets: IBucket[] = [];

  public static metadata: any;

  public static setMetadata = (metadata: any) => (S3BucketMockService.metadata = metadata);

  /**
   * Uploads a file to an S3 bucket
   * @param bucketName - the bucket to upload to
   * @param fileName - the name of the file
   * @param content - contents of the file
   * @param metadata - optional metadata
   */
  public async upload(bucketName: string, fileName: string, content: Buffer | Uint8Array | Blob | string | Readable, metadata?: Record<string, string>): Promise<PutObjectCommandOutput> {
    const bucket: IBucket | undefined = S3BucketMockService.buckets.find((currentBucket: IBucket) => currentBucket.bucketName === bucketName);

    if (!bucket) {
      const error: Error = new Error();
      Object.assign(error, {
        message: 'The specified bucket does not exist.',
        code: 'NoSuchBucket',
        statusCode: 404,
        retryable: false,
      });

      throw error;
    }

    const bucketKey: string | undefined = bucket.files.find((currentFileName: string) => currentFileName === fileName);

    if (!bucketKey) {
      const error: Error = new Error();
      Object.assign(error, {
        message: 'The specified key does not exist.',
        code: 'NoSuchKey',
        statusCode: 404,
        retryable: false,
      });

      throw error;
    }

    const response: any = {
      Location: `http://localhost:7000/${bucketName}/${fileName}`,
      ETag: '621c9c14d75958d4c3ed8ad77c80cde1',
      Bucket: bucketName,
      Key: fileName,
    };

    return response;
  }

  /**
   * Downloads a file from an S3 bucket
   * @param bucketName - the bucket from which to download
   * @param fileName - the name of the file
   */
  public async download(bucketName: string, fileName: string): Promise<GetObjectCommandOutput> {
    const bucket: IBucket | undefined = S3BucketMockService.buckets.find((currentBucket: IBucket) => currentBucket.bucketName === bucketName);
    if (!bucket) {
      const error: Error = new Error();

      Object.assign(error, {
        message: 'The specified bucket does not exist.',
        code: 'NoSuchBucket',
        statusCode: 404,
        retryable: false,
      });
      throw error;
    }
    const bucketKey: string | undefined = bucket.files.find((currentFileName: string) => currentFileName === fileName);

    if (!bucketKey) {
      const error: Error = new Error();
      Object.assign(error, {
        message: 'The specified key does not exist.',
        code: 'NoSuchKey',
        statusCode: 404,
        retryable: false,
      });

      throw error;
    }

    const file: any = fs.readFileSync(path.resolve(__dirname, `../resources/certificates/base64/${bucketKey}`));
    const data: GetObjectCommandOutput = {
      Body: file,
      ContentLength: file.length,
      ETag: '621c9c14d75958d4c3ed8ad77c80cde1',
      LastModified: new Date(),
      Metadata: S3BucketMockService.metadata,
      $metadata: {},
    };

    return data;
  }
}

export { S3BucketMockService };
