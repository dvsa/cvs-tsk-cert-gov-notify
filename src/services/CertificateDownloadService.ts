import {Configuration} from "../utils/Configuration";
import {S3BucketService} from "./S3BucketService";
import {Service} from "../models/injector/ServiceDecorator";
import S3 from "aws-sdk/clients/s3";


/**
 * Service class for Certificate Generation
 */
@Service()
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
             const notifyPartialParams = {
                personalisation: {
                    vrms: result.Metadata!["x-amz-meta-vrm"],
                    test_type_name: result.Metadata!["x-amz-meta-test-type-name"],
                    date_of_issue: result.Metadata!["x-amz-meta-date-of-issue"],
                    cert_index: result.Metadata!["x-amz-meta-cert-index"],
                    total_certs: result.Metadata!["x-amz-meta-total-certs"],
                    test_type_result: result.Metadata!["x-amz-meta-test-type-result"],
                    cert_type: result.Metadata!["x-amz-meta-cert-type"],
                    file_format: result.Metadata!["x-amz-meta-file-format"],
                    file_size: result.Metadata!["x-amz-meta-file-size"]
                },
                email: result.Metadata!["x-amz-meta-email"],
                certificate: result.Body
            };
             console.log(`Notify partial params: ${JSON.stringify(notifyPartialParams)}`);
             return notifyPartialParams;
        }).catch((error) => {
                console.error(error);
            });
    }

}

export {CertificateDownloadService};
