/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-constructor */
/**
 * Mock class for NotifyClient
 */

class NotifyClientMock {
  public static prepareUploadResponseFile: Buffer;

  public static sendEmailResponse: any;

  // eslint-disable-next-line @typescript-eslint/no-empty-function, no-empty-function, @typescript-eslint/no-useless-constructor
  constructor(apiKey: any) {}

  /**
   * Mock method for sendEmail. Simulates response for sending email with MOT notification client
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  public async sendEmail(templateId: string, destination: string, personalization: any) {
    return NotifyClientMock.sendEmailResponse;
  }

  /**
   * Mock method for prepareUpload. Simulates response for calling prepareUpload metho for MOT notification client.
   */
  public prepareUpload(pdfData: any) {
    return {
      result: {
        file: NotifyClientMock.prepareUploadResponseFile,
      },
    };
  }
}

export { NotifyClientMock };
