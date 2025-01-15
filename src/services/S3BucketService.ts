import { GetObjectCommand, GetObjectCommandOutput, S3Client } from '@aws-sdk/client-s3';
import { ServiceException } from '@smithy/smithy-client';
import AWSXRay from 'aws-xray-sdk';
import { Service } from 'typedi';
import { IS3Config } from '../models';
import { Configuration } from '../utils/Configuration';

/**
 * Service class for communicating with Simple Storage Service
 */
@Service()
class S3BucketService {
	public readonly s3Client: S3Client;

	constructor(s3Client: S3Client) {
		const config: IS3Config = Configuration.getInstance().getS3Config();
		this.s3Client = AWSXRay.captureAWSv3Client(new S3Client({ ...s3Client, ...config }));
	}

	/**
	 * Downloads a file from an S3 bucket
	 * @param bucketName - the bucket from which to download
	 * @param fileName - the name of the file
	 */
	public async download(bucketName: string, fileName: string): Promise<GetObjectCommandOutput | ServiceException> {
		console.log(`Downloading file: bucket name: ${bucketName}, key: ${fileName}`);
		const command = new GetObjectCommand({
			Bucket: bucketName,
			Key: fileName,
		});

		const response = await this.s3Client.send(command);
		return response;
	}
}

export { S3BucketService };
