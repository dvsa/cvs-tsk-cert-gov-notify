import { Inject } from 'typedi';
import { DocumentTypes, IGetObjectCommandOutput, IPartialParams } from '../models';
import { NotificationService } from '../services/NotificationService';
import { BaseEmailRecord } from './BaseEmailRecord';

export class TflFeedEmail extends BaseEmailRecord {
	constructor(@Inject() notificationService: NotificationService) {
		super(notificationService);
	}

	public async sendEmail(certificate: IGetObjectCommandOutput) {
		const emailList = process.env.TFL_EMAIL_LIST?.split(',') ?? [];
		const partialParams = this.generatePartialParameters(certificate);
		for (const email of emailList) {
			partialParams.email = email; // replace email with real email from the TFL feed data.
			await this.notificationService.sendNotification(partialParams!, true);
		}
	}

	protected generatePartialParameters(certificate: IGetObjectCommandOutput): IPartialParams {
		return {
			email: '',
			shouldEmail: 'true',
			fileData: certificate.Body,
			documentType: DocumentTypes.TFL_FEED,
			personalisation: {},
		};
	}
}
