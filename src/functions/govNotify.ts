import { S3Client } from '@aws-sdk/client-s3';
import { Handler, SQSBatchItemFailure, SQSBatchResponse, SQSEvent } from 'aws-lambda';
import 'reflect-metadata';
import { AxiosError } from 'axios';
import Container from 'typedi';
import { ERRORS } from '../assets/enum';
import { NotificationService } from '../services/NotificationService';
import { EmailRequestProcessor } from './EmailRequestProcessor';

/**
 * λ function to process an SQS record and initialise email notifications for generated certificates
 * @param event - SQS event
 */
const govNotify: Handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
	if (!event || !event.Records || !Array.isArray(event.Records) || !event.Records.length) {
		console.error('ERROR: event is not defined.');
		throw new Error(ERRORS.EventIsEmpty);
	}

	Container.set(S3Client, new S3Client());
	const processRequest = Container.get(EmailRequestProcessor);
	const notificationService = Container.get(NotificationService);
	await notificationService.initializeNotifyClient();

	const batchItemFailures: SQSBatchItemFailure[] = [];

	for (const sqsRecord of event.Records) {
		try {
			const s3Records = processRequest.getRecordS3Objects(sqsRecord);
			for (const record of s3Records) {
				await processRequest.process(record);
			}
		} catch (error) {
			const isAxiosError = typeof error === 'object' && error && 'isAxiosError' in error && error.isAxiosError;
			if (isAxiosError) {
				console.error('ERROR: Axios response error', (error as AxiosError).response?.data);
			}
			console.error(error);
			console.error(error);
			batchItemFailures.push({ itemIdentifier: sqsRecord.messageId });
		}
	}

	return { batchItemFailures };
};

export { govNotify };
