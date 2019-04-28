// @ts-ignore
import {NotifyClient} from "notifications-node-client";
import {Service} from "../models/injector/ServiceDecorator";
import {NotifyClientMock} from "../../tests/models/NotifyClientMock";

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

        return this.notifyClient.sendEmail("1b602e0e-b53a-452a-858f-c5831ef3ed70", params.email, emailDetails)
        .then((response: any) => {
            return response;
        })
        .catch((err: any) => {
            console.error(err);
        });
    }
}

export { NotificationService };
