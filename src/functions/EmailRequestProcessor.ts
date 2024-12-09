import { S3Event, S3EventRecord, SQSRecord } from 'aws-lambda';
import { Service } from 'typedi';
import { CertificateRecord } from '../factories/CertificateRecord';
import { LetterRecord } from '../factories/LetterRecord';
import { PlateRecord } from '../factories/PlateRecord';
import { TflFeed } from '../factories/TflFeed';
import { DocumentTypes, IGetObjectCommandOutput } from '../models';
import { CertificateDownloadService } from '../services/CertificateDownloadService';
import { NotificationService } from '../services/NotificationService';

@Service()
export class EmailRequestProcessor {
	constructor(
		private notificationService: NotificationService,
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

		const certType = this.calculateCertType(decodedS3Key, certificate);
		switch (certType) {
			case DocumentTypes.TFL_FEED:
				const tflFeed = new TflFeed(this.notificationService);
				tflFeed.sendEmail(certificate);
				break;
			case DocumentTypes.CERTIFICATE:
				const documentRecord = new CertificateRecord(this.notificationService);
				documentRecord.sendEmail(certificate);
				break;
			case DocumentTypes.MINISTRY_PLATE:
				const plateRecord = new PlateRecord(this.notificationService);
				plateRecord.sendEmail(certificate);
				break;
			case DocumentTypes.TRAILER_INTO_SERVICE:
				const letterRecord = new LetterRecord(this.notificationService);
				letterRecord.sendEmail(certificate);
				break;
			default:
				throw new Error('Unsupported certificate type');
		}
	}

	private calculateCertType(filename: string, certificate: IGetObjectCommandOutput): DocumentTypes {
		if (filename.includes('VOSA')) {
			return DocumentTypes.TFL_FEED;
		}

		if (certificate.Metadata!['cert-type']) {
			return DocumentTypes.CERTIFICATE;
		}

		return certificate.Metadata!['document-type'] as DocumentTypes;
	}
}
