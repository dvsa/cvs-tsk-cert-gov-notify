import { DocumentTypes, IGetObjectCommandOutput, IPartialParams } from "../models";

export class EmailGenerationService {
    constructor() {};

    public generate(certificate: any): IPartialParams { 
        const certType = certificate.Metadata!['cert-type']
    
        switch (certType) {
            case DocumentTypes.CERTIFICATE:
                return this.generateCertificatePartialParams(certificate);
            case DocumentTypes.MINISTRY_PLATE:
                return this.generateCertificatePartialParams(certificate);
            case DocumentTypes.TRAILER_INTO_SERVICE:
                return this.generateCertificatePartialParams(certificate);
            case DocumentTypes.TFL_FEED:
                return this.generateCertificatePartialParams(certificate);
            default:
                throw new Error('Unsupported certificate type');
        }
    }

      /**
   * this method is used to generate the data needed just for certificates only
   * @param result
   * @returns set of notify params needed
   */
      private generateCertificatePartialParams(result: IGetObjectCommandOutput): IPartialParams {
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
  private generatePartialParams(result: IGetObjectCommandOutput): IPartialParams {
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
  private generateTFLFeedParams(result: IGetObjectCommandOutput): IPartialParams {
    return {
      email: '',
      shouldEmail: 'true',
      fileData: result.Body,
      documentType: DocumentTypes.TFL_FEED,
      personalisation: {},
    };
  }
}