import {Callback, Context, Handler, S3Event, S3EventRecord, SQSEvent, SQSRecord} from "aws-lambda";
import {ManagedUpload} from "aws-sdk/clients/s3";
import {CertificateDownloadService} from "../services/CertificateDownloadService";
import {Injector} from "../models/injector/Injector";
import {NotificationService} from "../services/NotificationService";

/**
 * λ function to process an SQS record and initialise email notifications for generated certificates
 * @param event - SQS event
 * @param context - λ Context
 * @param callback - callback function
 */
const govNotify: Handler = async (event: SQSEvent, context?: Context, callback?: Callback): Promise<void | ManagedUpload.SendData[]> => {
    if (!event) {
        console.error("ERROR: event is not defined.");
        return;
    }

    const downloadService: CertificateDownloadService = Injector.resolve<CertificateDownloadService>(CertificateDownloadService);
    const notifyService: NotificationService = Injector.resolve<NotificationService>(NotificationService);
    const notifyPromises: Array<Promise<any>> = [];

    event.Records.forEach((sqsRecord: SQSRecord) => {
        const objectPutEvent: S3Event = JSON.parse(sqsRecord.body);

        objectPutEvent.Records.forEach((s3Record: S3EventRecord) => {
            const s3Object: any = s3Record.s3.object;

            const notifyPromise = downloadService.getCertificate(s3Object.key)
            .then((result: any) => {
                return notifyService.sendNotification(result);
            });

            notifyPromises.push(notifyPromise);
        });
    });

    return Promise.all(notifyPromises)
    .catch((error: any) => {
        console.error(error);
    });
};

export {govNotify};
