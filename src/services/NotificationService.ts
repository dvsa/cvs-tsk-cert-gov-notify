// @ts-ignore
import { NotifyClient } from "notifications-node-client";
import {CERT_TYPE, TEMPLATEIDS} from "../assets/enum";

/**
 * Service class for Certificate Notifications
 */
class NotificationService {
  private readonly notifyClient: NotifyClient;

  constructor(notifyClient: NotifyClient) {
    this.notifyClient = notifyClient;
  }

  /**
   * Sending email with the certificate according to the given params
   * @param params - personalization details,email and certificate
   */
  public sendNotification(notifyPartialParams: any) {
    const emailDetails = {
      personalisation: {
        ...notifyPartialParams.personalisation,
        link_to_document: this.notifyClient.prepareUpload(notifyPartialParams.certificate)
      }
    };

    const emailTemplateId = notifyPartialParams.personalisation.cert_type === CERT_TYPE.VTG6_VTG7 ? TEMPLATEIDS.PLATES_EMAIL : TEMPLATEIDS.CERTIFICATE_EMAIL;

    console.log(`Sent email using ${emailTemplateId} templateId, ${notifyPartialParams.personalisation.test_type_name} test type name and ${notifyPartialParams.personalisation.date_of_issue} date of issue`);
    return this.notifyClient.sendEmail(emailTemplateId, notifyPartialParams.email, emailDetails)
      .then((response: any) => {
        return response;
      })
      .catch((err: any) => {
        console.error(err);
        throw err;
      });
  }
}

export { NotificationService };
