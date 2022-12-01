// @ts-ignore
import { NotifyClient } from "notifications-node-client";
import { Configuration } from "../utils/Configuration";

/**
 * Service class for Certificate Notifications
 */
class NotificationService {
  private readonly notifyClient: NotifyClient;
  private readonly config: Configuration;

  constructor(notifyClient: NotifyClient) {
    this.notifyClient = notifyClient;
    this.config = Configuration.getInstance();
  }

  /**
   * Sending email with the certificate according to the given params
   * @param params - personalization details,email and certificate
   */
  public async sendNotification(notifyPartialParams: any) {
    const emailDetails = {
      personalisation: {
        ...notifyPartialParams.personalisation,
        link_to_document: this.notifyClient.prepareUpload(notifyPartialParams.certificate, {confirmEmailBeforeDownload: false}),
      },
    };
    const templateId = await this.config.getTemplateIdFromEV();

    console.log(`Sent email using ${templateId} templateId, ${notifyPartialParams.personalisation.test_type_name} test type name and ${notifyPartialParams.personalisation.date_of_issue} date of issue`);
    return this.notifyClient
      .sendEmail(templateId, notifyPartialParams.email, emailDetails)
      .then((response: any) => response.data)
      .catch((err: any) => {
        console.error(err);
        throw err;
      });
  }
}

export { NotificationService };
