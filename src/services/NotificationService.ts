// @ts-ignore
import {NotifyClient} from "notifications-node-client";
import {Service} from "../models/injector/ServiceDecorator";
import {NotifyClientMock} from "../../tests/models/NotifyClientMock";
import {TEMPLATEIDS} from "../assets/enum";

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
    public sendNotification(params: any) {
        const emailDetails = {
            personalisation: {
                ...params.personalisation,
                link_to_document: this.notifyClient.prepareUpload(params.certificate)
            }
        };

        console.log(`Sent email using ${TEMPLATEIDS.CertificateEmail} templateId, ${params.personalisation.test_type_name} test type name and ${params.personalisation.date_of_issue} date of issue`);
        return this.notifyClient.sendEmail(TEMPLATEIDS.CertificateEmail, params.email, emailDetails)
        .then((response: any) => {
            return response;
        })
        .catch((err: any) => {
            console.error(err);
        });
    }
}

export { NotificationService };
