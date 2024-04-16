import { GetObjectCommand, GetObjectCommandOutput, S3Client } from "@aws-sdk/client-s3";
import { Configuration } from "../utils/Configuration";
import { IS3Config } from "../models";
import { ServiceException } from "@smithy/smithy-client";
import AWSXRay from "aws-xray-sdk";

/**
 * Service class for communicating with Simple Storage Service
 */
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
    console.log(`Downloading file: bucket name: ${bucketName}, key: ${process.env.BRANCH}/${fileName}`);
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: `${process.env.BRANCH}/${fileName}`,
    });

    try {
      const response = await this.s3Client.send(command);
      return response
    } catch (err) {
      throw err;
    }
  }
}

export { S3BucketService };
