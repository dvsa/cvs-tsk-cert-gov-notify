import { Inject } from 'typedi';
import { IGetObjectCommandOutput, IPartialParams } from '../models';
import { NotificationService } from '../services/NotificationService';

export abstract class BaseEmailRecord {
	protected notificationService: NotificationService;

	constructor(@Inject() notificationService: NotificationService) {
		this.notificationService = notificationService;
	}

	public async sendEmail(certificate: IGetObjectCommandOutput, fileName: string | null = null): Promise<void> {
		const partialParams = this.generatePartialParameters(certificate);
		await this.notificationService.sendNotification(partialParams, this.getTemplateId(), fileName);
	}

	protected abstract generatePartialParameters(certificate: IGetObjectCommandOutput): IPartialParams;
	protected abstract getTemplateId(): string;
}
