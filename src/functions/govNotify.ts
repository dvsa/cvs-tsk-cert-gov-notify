/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable consistent-return */
/* eslint-disable import/no-unresolved */
import { Callback, Context, Handler, SQSBatchItemFailure, SQSBatchResponse, SQSEvent } from 'aws-lambda';
// @ts-ignore
import Container from 'typedi';
import { ERRORS } from '../assets/enum';
import { NotificationService } from '../services/NotificationService';
import { EmailRequestProcessor } from './EmailRequestProcessor';

/**
 * λ function to process an SQS record and initialise email notifications for generated certificates
 * @param event - SQS event
 * @param context - λ Context
 * @param callback - callback function
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const govNotify: Handler = async (
	event: SQSEvent,
	context?: Context,
	callback?: Callback
): Promise<SQSBatchResponse> => {
	if (!event || !event.Records || !Array.isArray(event.Records) || !event.Records.length) {
		console.error('ERROR: event is not defined.');
		throw new Error(ERRORS.EventIsEmpty);
	}

	const processRequest = Container.get(EmailRequestProcessor);
	const notificationService = Container.get(NotificationService);
	notificationService.initializeNotifyClient();

	const batchItemFailures: SQSBatchItemFailure[] = [];

	for (const sqsRecord of event.Records) {
		try {
			const s3Records = processRequest.getRecordS3Objects(sqsRecord);
			for (const record of s3Records) {
				await processRequest.process(record);
			}
		} catch (error) {
			console.error(error);
			batchItemFailures.push({ itemIdentifier: sqsRecord.messageId });
		}
	}

	return { batchItemFailures };
};

export { govNotify };
