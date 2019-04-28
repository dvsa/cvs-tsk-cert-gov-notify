/**
 * Mock class for NotifyClient
 */

class NotifyClientMock {

    public static prepareUploadResponseFile: Buffer;
    public static sendEmailResponse: any;

    // tslint:disable-next-line:no-empty
    constructor(apiKey: any) {}

    /**
     * Mock method for sendEmail. Simulates response for sending email with MOT notification client
     */
    public async sendEmail(templateId: string, destination: string, personalization: any) {
        return NotifyClientMock.sendEmailResponse;
    }

    /**
     * Mock method for prepareUpload. Simulates response for calling prepareUpload metho for MOT notification client.
     */
    public prepareUpload(pdfData: any) {
        return {
            result: {
                file: NotifyClientMock.prepareUploadResponseFile
            }
        };
    }
}

export {NotifyClientMock};
