/* eslint-disable consistent-return */
/* eslint-disable import/no-unresolved */
import {
  Callback, Context, Handler, S3Event, S3EventRecord, SQSEvent, SQSRecord,
} from 'aws-lambda';
import { PutObjectCommandOutput, S3Client } from '@aws-sdk/client-s3';
// @ts-ignore
import { NotifyClient } from 'notifications-node-client';
import { CertificateDownloadService } from '../services/CertificateDownloadService';
import { NotificationService } from '../services/NotificationService';
import { ERRORS } from '../assets/enum';
import { Configuration } from '../utils/Configuration';
import { S3BucketService } from '../services/S3BucketService';
import { IPartialParams } from '../models';

/**
 * λ function to process an SQS record and initialise email notifications for generated certificates
 * @param event - SQS event
 * @param context - λ Context
 * @param callback - callback function
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const govNotify: Handler = async (event: SQSEvent, context?: Context, callback?: Callback): Promise<void | PutObjectCommandOutput[]> => {
  if (!event || !event.Records || !Array.isArray(event.Records) || !event.Records.length) {
    console.error('ERROR: event is not defined.');
    throw new Error(ERRORS.EventIsEmpty);
  }

  const downloadService: CertificateDownloadService = new CertificateDownloadService(new S3BucketService(new S3Client()));
  const notifyConfig = await Configuration.getInstance().getNotifyConfig();
  const notifyClient = new NotifyClient(notifyConfig.api_key);
  const notifyService: NotificationService = new NotificationService(notifyClient);
  const notifyPromises: Array<Promise<any>> = [];

  event.Records.forEach((sqsRecord: SQSRecord) => {
    const objectPutEvent: S3Event = JSON.parse(sqsRecord.body);

    if (objectPutEvent.Records) {
      objectPutEvent.Records.forEach((s3Record: S3EventRecord) => {
        const s3Object: any = s3Record.s3.object;
        // Object key may have spaces or unicode non-ASCII characters.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const decodedS3Key = decodeURIComponent(s3Object.key.replace(/\+/g, ' '));

        if (decodedS3Key.includes('VOSA')) {
          const emailList = process.env.TFL_EMAIL_LIST?.split(',');
          emailList?.forEach((email) => {
            const notifyPromise = downloadService.getCertificate(decodedS3Key).then((notifyPartialParams: IPartialParams) => {
              if (!notifyPartialParams.shouldEmail || notifyPartialParams.shouldEmail === 'true') {
                notifyPartialParams.email = email;
                return notifyService.sendNotification(notifyPartialParams);
              }
            });
            notifyPromises.push(notifyPromise);
          });
        } else {
          const notifyPromise = downloadService.getCertificate(decodedS3Key).then((notifyPartialParams: IPartialParams) => {
            if (!notifyPartialParams.shouldEmail || notifyPartialParams.shouldEmail === 'true') {
              return notifyService.sendNotification(notifyPartialParams);
            }
          });
          notifyPromises.push(notifyPromise);
        }
      });
    }
  });

  return Promise.all(notifyPromises).catch((error: any) => {
    console.error(error);
    throw error;
  });
};

export { govNotify };
