import S3 from "aws-sdk/clients/s3";
import { DocumentTypes, IPartialParams } from "../models";
import { Configuration } from "../utils/Configuration";
import { S3BucketService } from "./S3BucketService";

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
    const bucket = fileName.includes("VOSA") ? `cvs-enquiry-document-feed-${process.env.BRANCH}` : `cvs-cert-${process.env.BUCKET}`;

    return this.s3Client
      .download(bucket, fileName)
      .then((result: S3.Types.GetObjectOutput) => {
        console.log(`Downloading result: ${JSON.stringify(this.cleanForLogging(result))}`);

        return fileName.includes("VOSA") ? this.generateTFLFeedParams(result) : result.Metadata!["cert-type"] ? this.generateCertificatePartialParams(result) : this.generatePartialParams(result);
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  }

  /**
   * this method is used to generate the data needed just for certificates only
   * @param result
   * @returns set of notify params needed
   */
  public generateCertificatePartialParams(result: S3.Types.GetObjectOutput): IPartialParams {
    switch (result.Metadata!['cert-type']) {
      // ADR certificates
      case "ADR01C":
        return {
          personalisation: {
            vrms: result.Metadata!.vrm,
            test_type_name: result.Metadata!["test-type-name"],
            date_of_issue: result.Metadata!["date-of-issue"],
            cert_index: result.Metadata!["cert-index"],
            total_certs: result.Metadata!["total-certs"],
            test_type_result: result.Metadata!["test-type-result"],
            cert_type: result.Metadata!["cert-type"],
            file_format: result.Metadata!["file-format"],
            file_size: result.Metadata!["file-size"],
          },
          email: result.Metadata!.email,
          shouldEmail: result.Metadata!["should-email-certificate"],
          fileData: result.Body,
          documentType: DocumentTypes.ADR_CERTIFICATE,
        };
      // Other cetificates (MOT)
      default:
        return {
          personalisation: {
            vrms: result.Metadata!.vrm,
            test_type_name: result.Metadata!["test-type-name"],
            date_of_issue: result.Metadata!["date-of-issue"],
            cert_index: result.Metadata!["cert-index"],
            total_certs: result.Metadata!["total-certs"],
            test_type_result: result.Metadata!["test-type-result"],
            cert_type: result.Metadata!["cert-type"],
            file_format: result.Metadata!["file-format"],
            file_size: result.Metadata!["file-size"],
          },
          email: result.Metadata!.email,
          shouldEmail: result.Metadata!["should-email-certificate"],
          fileData: result.Body,
          documentType: DocumentTypes.CERTIFICATE,
        };
    }
  }

  /**
   * this method is used to generate the data needed based on the provided document type
   * @param result
   * @returns set of notify params needed
   */
  public generatePartialParams(result: S3.Types.GetObjectOutput): IPartialParams {
    let personalisation;
    const documentType: DocumentTypes = result.Metadata!["document-type"] as DocumentTypes;

    if (documentType === DocumentTypes.MINISTRY_PLATE) {
      personalisation = {
        vrms: result.Metadata!.vrm,
        date_of_issue: result.Metadata!["date-of-issue"],
      };
    } else if (documentType === DocumentTypes.TRAILER_INTO_SERVICE) {
      personalisation = {
        date_of_issue: result.Metadata!["date-of-issue"],
        trailer_id: result.Metadata!["trailer-id"],
      };
    }

    const partialParams = {
      email: result.Metadata!.email,
      shouldEmail: result.Metadata!["should-email-certificate"],
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
  public generateTFLFeedParams(result: S3.Types.GetObjectOutput): IPartialParams {
    return {
      email: "",
      shouldEmail: "true",
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
