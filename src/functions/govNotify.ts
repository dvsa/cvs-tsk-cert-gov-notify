/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable consistent-return */
/* eslint-disable import/no-unresolved */
import { S3Client } from '@aws-sdk/client-s3';
import {
  Callback, Context, Handler, S3Event,
  SQSBatchItemFailure, SQSBatchResponse, SQSEvent,
} from 'aws-lambda';
// @ts-ignore
import { NotifyClient } from 'notifications-node-client';
import { ERRORS } from '../assets/enum';
import { CertificateDownloadService } from '../services/CertificateDownloadService';
import { NotificationService } from '../services/NotificationService';
import { S3BucketService } from '../services/S3BucketService';
import { Configuration } from '../utils/Configuration';

/**
 * λ function to process an SQS record and initialise email notifications for generated certificates
 * @param event - SQS event
 * @param context - λ Context
 * @param callback - callback function
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const govNotify: Handler = async (event: SQSEvent, context?: Context, callback?: Callback): Promise<SQSBatchResponse> => {
  if (!event || !event.Records || !Array.isArray(event.Records) || !event.Records.length) {
    console.error('ERROR: event is not defined.');
    throw new Error(ERRORS.EventIsEmpty);
  }

  const downloadService: CertificateDownloadService = new CertificateDownloadService(new S3BucketService(new S3Client()));
  const notifyConfig = await Configuration.getInstance().getNotifyConfig();
  const notifyClient = new NotifyClient(notifyConfig.api_key);
  const notifyService: NotificationService = new NotificationService(notifyClient);
  const batchItemFailures: SQSBatchItemFailure[] = [];

  for (const sqsRecord of event.Records) {
    try {
      const objectPutEvent: S3Event = JSON.parse(sqsRecord.body);

      if (objectPutEvent.Records) {
        for (const s3Record of objectPutEvent.Records) {
          const s3Object: any = s3Record.s3.object;
          // Object key may have spaces or unicode non-ASCII characters.
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          const decodedS3Key = decodeURIComponent(s3Object.key.replace(/\+/g, ' '));
          const notifyPartialParams = await downloadService.getCertificate(decodedS3Key);

          if (!notifyPartialParams.shouldEmail || notifyPartialParams.shouldEmail === 'true') {
            if (decodedS3Key.includes('VOSA')) {
              const emailList = process.env.TFL_EMAIL_LIST?.split(',');
              for (const email of emailList ?? []) {
                notifyPartialParams.email = email;
                await notifyService.sendNotification(notifyPartialParams);
              }
            } else {
              await notifyService.sendNotification(notifyPartialParams);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      batchItemFailures.push({ itemIdentifier: sqsRecord.messageId });
    }
  }

  return { batchItemFailures };
};

export { govNotify };
