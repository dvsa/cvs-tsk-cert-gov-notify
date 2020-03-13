import { Configuration } from "../utils/Configuration";
import { S3BucketService } from "./S3BucketService";
import S3 from "aws-sdk/clients/s3";


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
  public getCertificate(fileName: string) {
    return this.s3Client.download(`cvs-cert-${process.env.BUCKET}`, fileName)
      .then((result: S3.Types.GetObjectOutput) => {
        console.log(`Downloading result: ${JSON.stringify(this.cleanForLogging(result))}`);
        const notifyPartialParams = {
          personalisation: {
            vrms: result.Metadata!.vrm,
            test_type_name: result.Metadata!["test-type-name"],
            date_of_issue: result.Metadata!["date-of-issue"],
            cert_index: result.Metadata!["cert-index"],
            total_certs: result.Metadata!["total-certs"],
            test_type_result: result.Metadata!["test-type-result"],
            cert_type: result.Metadata!["cert-type"],
            file_format: result.Metadata!["file-format"],
            file_size: result.Metadata!["file-size"]
          },
          email: result.Metadata!.email,
          shouldEmailCertificate: result.Metadata!["should-email-certificate"],
          certificate: result.Body
        };
        // console.log(`Notify partial params: ${JSON.stringify(notifyPartialParams)}`);
        return notifyPartialParams;
      }).catch((error) => {
        console.error(error);
        throw error;
      });
  }

  /**
   * reduce bloat in cloudwatch logs by trimming out meaningless data
   * @param input
   */
  public cleanForLogging(input: any) {
    const retVal = {...input};
    retVal.Body = {redacted: true};
    if (retVal.$response) {
      delete retVal.$response;
    }
    return retVal;
  }

}

export { CertificateDownloadService };
