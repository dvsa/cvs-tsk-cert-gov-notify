// @ts-ignore
import { Callback, Context, Handler, S3Event, S3EventRecord, SQSEvent, SQSRecord } from "aws-lambda";
import { ManagedUpload } from "aws-sdk/clients/s3";
import { CertificateDownloadService } from "../services/CertificateDownloadService";
import { NotificationService } from "../services/NotificationService";
import { ERRORS } from "../assets/enum";
import { S3 } from "aws-sdk";
// @ts-ignore
import { NotifyClient } from "notifications-node-client";
import { Configuration } from "../utils/Configuration";
import { S3BucketService } from "../services/S3BucketService";

/**
 * λ function to process an SQS record and initialise email notifications for generated certificates
 * @param event - SQS event
 * @param context - λ Context
 * @param callback - callback function
 */
const govNotify: Handler = async (event: SQSEvent, context?: Context, callback?: Callback): Promise<void | ManagedUpload.SendData[]> => {
  if (!event || !event.Records || !Array.isArray(event.Records) || !event.Records.length) {
    console.error("ERROR: event is not defined.");
    throw new Error(ERRORS.EventIsEmpty);
  }

  const downloadService: CertificateDownloadService = new CertificateDownloadService(new S3BucketService(new S3()));
  const notifyConfig = await Configuration.getInstance().getNotifyConfig();
  const notifyClient = new NotifyClient(notifyConfig.api_key);
  const notifyService: NotificationService = new NotificationService(notifyClient);
  const notifyPromises: Array<Promise<any>> = [];

  event.Records.forEach((sqsRecord: SQSRecord) => {
    const objectPutEvent: S3Event = JSON.parse(sqsRecord.body);

    objectPutEvent.Records.forEach((s3Record: S3EventRecord) => {
      const s3Object: any = s3Record.s3.object;

      const notifyPromise = downloadService.getCertificate(s3Object.key)
        .then((notifyPartialParams: any) => {
          if (!notifyPartialParams.shouldEmailCertificate || notifyPartialParams.shouldEmailCertificate === "true") {
            return notifyService.sendNotification(notifyPartialParams);
          }
        });

      notifyPromises.push(notifyPromise);
    });
  });

  return Promise.all(notifyPromises)
    .catch((error: any) => {
      console.error(error);
      throw error;
    });
};

export { govNotify };
