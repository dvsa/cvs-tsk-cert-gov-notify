import { Inject } from 'typedi';
import { ERRORS } from '../assets/enum';
import { DocumentTypes, IGetObjectCommandOutput, IPartialParams } from '../models';
import { NotificationService } from '../services/NotificationService';
import { BaseEmailRecord } from './BaseEmailRecord';

export class TflFeedEmail extends BaseEmailRecord {
	constructor(@Inject() notificationService: NotificationService) {
		super(notificationService);
	}

	public async sendEmail(certificate: IGetObjectCommandOutput, fileName: string | null = null) {
		const emailList = process.env.TFL_EMAIL_LIST?.split(',') ?? [];
		const partialParams = this.generatePartialParameters(certificate);
		for (const email of emailList) {
			partialParams.email = email; // replace email with real email from the TFL feed data.
			await this.notificationService.sendNotification(partialParams!, this.getTemplateId(), fileName);
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

	protected getTemplateId(): string {
		if (process.env.TFL_FEED_TEMPLATE_ID) {
			return process.env.TFL_FEED_TEMPLATE_ID;
		}

		throw new Error(ERRORS.TEMPLATE_ID_ENV_VAR_NOT_EXIST);
	}
}
