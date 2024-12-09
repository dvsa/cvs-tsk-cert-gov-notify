// @ts-ignore
import { NotifyClient } from 'notifications-node-client';
import { IPartialParams } from '../models';
import { Configuration } from '../utils/Configuration';

/**
 * Service class for Certificate Notifications
 */
class NotificationService {
	private notifyClient: NotifyClient;

	private readonly config: Configuration;

	constructor() {
		this.config = Configuration.getInstance();
	}

	public async initializeNotifyClient() {
		const notifyConfig = await Configuration.getInstance().getNotifyConfig();
		this.notifyClient = new NotifyClient(notifyConfig.api_key);
	}

	/**
	 * Sending email with the certificate according to the given params
	 * @param params - personalization details,email and certificate
	 */
	public async sendNotification(notifyPartialParams: IPartialParams, isCsv = false) {
		if (!notifyPartialParams?.shouldEmail || notifyPartialParams?.shouldEmail === 'true') {
			const emailDetails = {
				personalisation: {
					...notifyPartialParams.personalisation,
					link_to_document: this.notifyClient.prepareUpload(notifyPartialParams.fileData, {
						confirmEmailBeforeDownload: false,
						isCsv,
					}),
				},
			};
			const templateId = await this.config.getTemplateIdFromEV(notifyPartialParams.documentType);

			console.log(
				`Personalisation params: ${JSON.stringify(notifyPartialParams.personalisation)} + email ${notifyPartialParams.email}`
			);
			await this.notifyClient.sendEmail(templateId, notifyPartialParams.email, emailDetails);
			console.log(
				`Sent email using ${templateId} templateId, ${notifyPartialParams.documentType} with ${notifyPartialParams.personalisation.date_of_issue} date of issue`
			);
		}
	}
}

export { NotificationService };
