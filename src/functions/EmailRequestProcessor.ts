import { S3Event, S3EventRecord, SQSRecord } from 'aws-lambda';
import { Service } from 'typedi';
import { CertificateDownloadService } from '../services/CertificateDownloadService';
import { EmailAdapterStrategy } from '../services/EmailAdapterStrategy';

@Service()
export class EmailRequestProcessor {
	constructor(
		private emailAdapterStrategy: EmailAdapterStrategy,
		private downloadService: CertificateDownloadService
	) {}

	public getRecordS3Objects(record: SQSRecord): S3EventRecord['s3'][] {
		const s3Records = [];
		const objectPutEvent: S3Event = JSON.parse(record.body);

		if (objectPutEvent.Records) {
			for (const s3Record of objectPutEvent.Records) {
				const s3Object: S3EventRecord['s3'] = s3Record.s3;
				s3Records.push(s3Object);
			}
		}

		return s3Records;
	}

	public async process(s3Record: S3EventRecord['s3']) {
		const decodedS3Key = decodeURIComponent(s3Record.object.key.replace(/\+/g, ' '));
		const certificate = await this.downloadService.getCertificate(decodedS3Key, s3Record.bucket.name);
		const emailer = this.emailAdapterStrategy.getStrategy(decodedS3Key, certificate);
		await emailer.sendEmail(certificate);
	}
}
