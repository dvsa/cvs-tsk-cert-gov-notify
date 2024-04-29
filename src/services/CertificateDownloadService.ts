/* eslint-disable class-methods-use-this */
import { Stream } from 'stream';
import { IncomingMessage } from 'http';
import { Configuration } from '../utils/Configuration';
import { S3BucketService } from './S3BucketService';
import { DocumentTypes, IGetObjectCommandOutput, IPartialParams } from '../models';

/**
 * Service class for Certificate Generation
 */
class CertificateDownloadService {
  private readonly s3Client: S3BucketService;

  private readonly config: Configuration;

  constructor(s3Client: S3BucketService) {
    this.s3Client = s3Client;
    this.config = Configuration.getInstance();
  }

  /**
   * Fetches the certificate with the given file name from the bucket.
   * @param fileName - the file name of the certificate you want to download
   */
  public async getCertificate(fileName: string) {
    const bucket = fileName.includes('VOSA') ? `cvs-enquiry-document-feed-${process.env.BRANCH}` : `cvs-cert-${process.env.BUCKET}`;

    try {
      const result: any = await this.s3Client.download(bucket, fileName);

      console.log(`Downloading result: ${JSON.stringify(this.cleanForLogging(result))}`);

      const chunks: Buffer[] = [];
      // eslint-disable-next-line no-restricted-syntax
      for await (const chunk of Stream.Readable.from(result.Body as IncomingMessage)) {
        chunks.push(chunk as Buffer);
      }

      const buffer = Buffer.concat(chunks);
      const updatedResult: IGetObjectCommandOutput = { ...result, Body: buffer };

      // eslint-disable-next-line no-nested-ternary
      return fileName.includes('VOSA') ? this.generateTFLFeedParams(updatedResult) : updatedResult.Metadata!['cert-type'] ? this.generateCertificatePartialParams(updatedResult) : this.generatePartialParams(updatedResult);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * this method is used to generate the data needed just for certificates only
   * @param result
   * @returns set of notify params needed
   */
  public generateCertificatePartialParams(result: IGetObjectCommandOutput): IPartialParams {
    return {
      personalisation: {
        vrms: result.Metadata!.vrm,
        test_type_name: result.Metadata!['test-type-name'],
        date_of_issue: result.Metadata!['date-of-issue'],
        cert_index: result.Metadata!['cert-index'],
        total_certs: result.Metadata!['total-certs'],
        test_type_result: result.Metadata!['test-type-result'],
        cert_type: result.Metadata!['cert-type'],
        file_format: result.Metadata!['file-format'],
        file_size: result.Metadata!['file-size'],
      },
      email: result.Metadata!.email,
      shouldEmail: result.Metadata!['should-email-certificate'],
      fileData: result.Body,
      documentType: DocumentTypes.CERTIFICATE,
    };
  }

  /**
   * this method is used to generate the data needed based on the provided document type
   * @param result
   * @returns set of notify params needed
   */
  public generatePartialParams(result: IGetObjectCommandOutput): IPartialParams {
    let personalisation;
    const documentType: DocumentTypes = result.Metadata!['document-type'] as DocumentTypes;

    if (documentType === DocumentTypes.MINISTRY_PLATE) {
      personalisation = {
        vrms: result.Metadata!.vrm,
        date_of_issue: result.Metadata!['date-of-issue'],
      };
    } else if (documentType === DocumentTypes.TRAILER_INTO_SERVICE) {
      personalisation = {
        date_of_issue: result.Metadata!['date-of-issue'],
        trailer_id: result.Metadata!['trailer-id'],
      };
    }

    const partialParams: IPartialParams = {
      email: result.Metadata!.email,
      shouldEmail: result.Metadata!['should-email-certificate'],
      fileData: result.Body,
      documentType,
      personalisation,
    };

    return partialParams;
  }

  /**
   * this method is used to generate the data needed just for TFL only
   * @param result
   * @returns set of notify params needed
   */
  public generateTFLFeedParams(result: IGetObjectCommandOutput): IPartialParams {
    return {
      email: '',
      shouldEmail: 'true',
      fileData: result.Body,
      documentType: DocumentTypes.TFL_FEED,
      personalisation: {},
    };
  }

  /**
   * reduce bloat in cloudwatch logs by trimming out meaningless data
   * @param input
   */
  public cleanForLogging(input: any) {
    const retVal = { ...input };
    retVal.Body = { redacted: true };
    if (retVal.$response) {
      delete retVal.$response;
    }
    return retVal;
  }
}

export { CertificateDownloadService };
