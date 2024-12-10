/* eslint-disable class-methods-use-this */
import { IncomingMessage } from 'http';
import { Stream } from 'stream';
import { Service } from 'typedi';
import { IGetObjectCommandOutput } from '../models';
import { S3BucketService } from './S3BucketService';

/**
 * Service class for Certificate Generation
 */
@Service()
class CertificateDownloadService {
	private readonly s3Client: S3BucketService;

	constructor(s3Client: S3BucketService) {
		this.s3Client = s3Client;
	}

	/**
	 * Fetches the certificate with the given file name from the bucket.
	 * @param fileName - the file name of the certificate you want to download
	 */
	public async getCertificate(fileName: string, bucket: string) {
		try {
			const result: any = await this.s3Client.download(bucket, fileName);

			console.log(`Downloading result: ${JSON.stringify(CertificateDownloadService.cleanForLogging(result))}`);

			const chunks: Buffer[] = [];
			// eslint-disable-next-line no-restricted-syntax
			for await (const chunk of Stream.Readable.from(result.Body as IncomingMessage)) {
				chunks.push(chunk as Buffer);
			}

			const buffer = Buffer.concat(chunks);
			const updatedResult: IGetObjectCommandOutput = { ...result, Body: buffer };

			return updatedResult;
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	/**
	 * reduce bloat in cloudwatch logs by trimming out meaningless data
	 * @param input
	 */
	private static cleanForLogging(input: any) {
		const retVal = { ...input };
		retVal.Body = { redacted: true };
		if (retVal.$response) {
			retVal.$response = undefined;
		}
		return retVal;
	}
}

export { CertificateDownloadService };
