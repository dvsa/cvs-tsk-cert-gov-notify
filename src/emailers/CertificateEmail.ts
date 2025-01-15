import { Inject } from 'typedi';
import { ERRORS } from '../assets/enum';
import { DocumentTypes, IGetObjectCommandOutput, IPartialParams } from '../models';
import { NotificationService } from '../services/NotificationService';
import { BaseEmailRecord } from './BaseEmailRecord';

export class CertificateEmail extends BaseEmailRecord {
	notificationService: NotificationService;

	constructor(@Inject() notificationService: NotificationService) {
		super(notificationService);
		this.notificationService = notificationService;
	}

	protected generatePartialParameters(certificate: IGetObjectCommandOutput): IPartialParams {
		return {
			personalisation: {
				vrms: certificate.Metadata!.vrm,
				test_type_name: certificate.Metadata!['test-type-name'],
				date_of_issue: certificate.Metadata!['date-of-issue'],
				cert_index: certificate.Metadata!['cert-index'],
				total_certs: certificate.Metadata!['total-certs'],
				test_type_result: certificate.Metadata!['test-type-result'],
				cert_type: certificate.Metadata!['cert-type'],
				file_format: certificate.Metadata!['file-format'],
				file_size: certificate.Metadata!['file-size'],
			},
			email: certificate.Metadata!.email,
			shouldEmail: certificate.Metadata!['should-email-certificate'],
			fileData: certificate.Body,
			documentType: DocumentTypes.CERTIFICATE,
		};
	}

	protected getTemplateId(): string {
		if (process.env.CERTIFICATE_TEMPLATE_ID) {
			return process.env.CERTIFICATE_TEMPLATE_ID;
		}

		throw new Error(ERRORS.TEMPLATE_ID_ENV_VAR_NOT_EXIST);
	}
}
