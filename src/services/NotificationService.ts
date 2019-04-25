// @ts-ignore
import {NotifyClient} from "notifications-node-client";
import {Service} from "../models/injector/ServiceDecorator";
import {Configuration} from "../utils/Configuration";
import {IMOTConfig} from "../models";

@Service()
class NotificationService {
    private readonly notifyClient: NotifyClient;
    private readonly config: Configuration;
    private readonly motConfig: IMOTConfig;

    constructor() {
        this.config = Configuration.getInstance();
        this.motConfig = this.config.getMOTConfig();
        this.notifyClient = new NotifyClient(this.motConfig.api_key);
    }

    public sendNotification(params: any) {
        const emailDetails = {
            personalisation: {
                ...params.personalisation,
                link_to_document: this.notifyClient.prepareUpload(params.certificate)
            }
        };

        return this.notifyClient.sendEmail("1b602e0e-b53a-452a-858f-c5831ef3ed70", params.email, emailDetails)
        .then((response: any) => {
            console.log(response.body);
        })
        .catch((err: any) => {
            console.error(err);
        });
    }
}

export { NotificationService };
