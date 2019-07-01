// @ts-ignore
import {NotifyClient} from "notifications-node-client";
import {Service} from "../models/injector/ServiceDecorator";
import {NotifyClientMock} from "../../tests/models/NotifyClientMock";
import {TEMPLATEIDS} from "../assets/enum";
import {HTTPError} from "../models/HTTPError";

/**
 * Service class for Certificate Notifications
 */
@Service()
class NotificationService {
    private readonly notifyClient: NotifyClient | NotifyClientMock;

    constructor(notifyClient: NotifyClient | NotifyClientMock) {
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
        return this.notifyClient.sendEmail(TEMPLATEIDS.CertificateEmail, notifyPartialParams.email, emailDetails)
        .then((response: any) => {
            console.log(`Sent email using ${TEMPLATEIDS.CertificateEmail} templateId, ${notifyPartialParams.personalisation.test_type_name} test type name and ${notifyPartialParams.personalisation.date_of_issue} date of issue`);
            return response;
        })
        .catch((err: any) => {
            console.error(err);
            throw new HTTPError(500, "Internal server error");
        });
    }
}

export { NotificationService };
