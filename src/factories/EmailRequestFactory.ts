import { Inject } from 'typedi';
import { IGetObjectCommandOutput, IPartialParams } from '../models';
import { NotificationService } from '../services/NotificationService';

export abstract class EmailRequestFactory {
	protected notificationService: NotificationService;

	constructor(@Inject() notificationService: NotificationService) {
		this.notificationService = notificationService;
	}

	public sendEmail(certificate: IGetObjectCommandOutput): void {
		const partialParams = this.generatePartialParameters(certificate);
		this.notificationService.sendNotification(partialParams);
	}

	protected abstract generatePartialParameters(certificate: IGetObjectCommandOutput): IPartialParams;
}
