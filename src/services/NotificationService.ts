// @ts-ignore
import {NotifyClient} from "notifications-node-client";
import {Service} from "../models/injector/ServiceDecorator";

@Service()
class NotificationService {
    private readonly notifyClient: NotifyClient;

    constructor(notifyClient: NotifyClient) {
        this.notifyClient = notifyClient;
    }

    public sendNotification(params: any) {
        this.notifyClient.sendEmail("1b602e0e-b53a-452a-858f-c5831ef3ed70", params.email, {
            personalisation: {
                ...params.personalisation,
                link_to_document: this.notifyClient.prepareUpload(params.certificate)
            }
        })
        .then((response: any) => {
            console.log(response.body)
        })
        .catch((err: any) => {
            console.error(err);
        });
    }
}

export { NotificationService };
