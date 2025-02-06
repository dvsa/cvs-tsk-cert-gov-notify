import { Inject } from 'typedi';
import { ERRORS } from '../assets/enum';
import { DocumentTypes, IGetObjectCommandOutput, IPartialParams } from '../models';
import { NotificationService } from '../services/NotificationService';
import { BaseEmailRecord } from './BaseEmailRecord';

export class PlateEmail extends BaseEmailRecord {
	notificationService: NotificationService;

	constructor(@Inject() notificationService: NotificationService) {
		super(notificationService);
		this.notificationService = notificationService;
	}

	protected generatePartialParameters(certificate: IGetObjectCommandOutput): IPartialParams {
		return {
			email: certificate.Metadata!.email,
			shouldEmail: certificate.Metadata!['should-email-certificate'],
			fileData: certificate.Body,
			documentType: DocumentTypes.MINISTRY_PLATE,
			personalisation: {
				vrms: certificate.Metadata!.vrm,
				date_of_issue: certificate.Metadata!['date-of-issue'],
			},
		};
	}

	protected getTemplateId(): string {
		if (process.env.PLATE_TEMPLATE_ID) {
			return process.env.PLATE_TEMPLATE_ID;
		}

		throw new Error(ERRORS.TEMPLATE_ID_ENV_VAR_NOT_EXIST);
	}
}
