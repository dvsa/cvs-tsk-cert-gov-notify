import { S3Event, S3EventRecord, SQSRecord } from "aws-lambda";
import { Service } from "typedi";
import { IGetObjectCommandOutput, IPartialParams } from "../models";
import { CertificateDownloadService } from "../services/CertificateDownloadService";
import { EmailGenerationService } from "../services/EmailGenerationService";
import { NotificationService } from "../services/NotificationService";


@Service()
export class EmailRequestProcessor {
    constructor(
        private notificationService: NotificationService,
        private downloadService: CertificateDownloadService,
        private emailGenerationService: EmailGenerationService
    ) {}

    public getRecordS3Objects(record: SQSRecord): (S3EventRecord['s3'])[] { 
        const s3Records = []
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

        if(decodedS3Key.includes('VOSA')) {
            this.processTflFeedEmail(certificate);
            return;
        }

        this.processDocumentEmail(certificate);
    }

    private async processTflFeedEmail(feedDocument: IGetObjectCommandOutput) { 
        feedDocument.Metadata!['cert-type'] = 'TFL_FEED';
        const partialParams = this.emailGenerationService.generate(feedDocument);
        const emailList = process.env.TFL_EMAIL_LIST?.split(',') ?? [];
        for (const email of emailList) {
            partialParams.email = email;  // replace email with real email from the TFL feed data.
            await this.sendEmail(partialParams);
        }
    }

    private async processDocumentEmail(document: IGetObjectCommandOutput) { 
        const partialParams = this.emailGenerationService.generate(document);
        await this.sendEmail(partialParams);
    }

    private async sendEmail(notifyPartialParams: IPartialParams) { 
        if (!notifyPartialParams?.shouldEmail || notifyPartialParams?.shouldEmail === 'true') {
            await this.notificationService.sendNotification(notifyPartialParams!);
        }
    }
}