import { S3EventRecord, SQSRecord } from 'aws-lambda';
import 'reflect-metadata';
import { EmailRequestProcessor } from '../../../src/functions/EmailRequestProcessor';
import { CertificateDownloadService } from '../../../src/services/CertificateDownloadService';
import { EmailAdapterStrategy } from '../../../src/services/EmailAdapterStrategy';

describe('Email Request Processors', () => {
	const returnedMockStrategy = {
		sendEmail: jest.fn().mockImplementation(async () => Promise.resolve()),
	};
	const mockEmailAdapterStrategy = {
		getStrategy: jest.fn().mockImplementation(() => returnedMockStrategy),
	};
	const mockDownloadService = {
		getCertificate: jest.fn().mockImplementation(() => Promise.resolve('some encoded certificate')),
	};
	const emailRequestProcess = new EmailRequestProcessor(
		mockEmailAdapterStrategy as unknown as EmailAdapterStrategy,
		mockDownloadService as unknown as CertificateDownloadService
	);

	describe('getRecordS3Objects', () => {
		it('should parse body with one record and return it in array', () => {
			const record = {
				body: JSON.stringify({
					Records: [{ s3: 'this is a s3 record' }],
				}),
			} as unknown as SQSRecord;

			const res = emailRequestProcess.getRecordS3Objects(record);

			expect(res.length).toEqual(1);
		});
		it('should parse body with two records and return it in array', () => {
			const record = {
				body: JSON.stringify({
					Records: [{ s3: 'this is a s3 record' }, { s3: 'this is another s3 record' }],
				}),
			} as unknown as SQSRecord;

			const res = emailRequestProcess.getRecordS3Objects(record);

			expect(res.length).toEqual(2);
		});
		it('should parse body with no records and return it in array', () => {
			const record = {
				body: JSON.stringify({
					foo: 'bar',
				}),
			} as unknown as SQSRecord;

			const res = emailRequestProcess.getRecordS3Objects(record);

			expect(res.length).toEqual(0);
		});
	});

	describe('process', () => {
		it('Should decodeUrl, get the certificate, retrieve the correct strategy email and execute that strategy email', async () => {
			jest.spyOn(global, 'decodeURIComponent').mockImplementation(() => 'decodedS3Key');

			await emailRequestProcess.process({
				eventVersion: '12312 fake mock',
				eventSource: 'fake source mock',
				bucket: {
					name: 'fake mock name'
				},
				object: {
					key: 'fake key mock',
				}
			} as unknown as S3EventRecord['s3']);

			expect(global.decodeURIComponent).toHaveBeenCalledWith('fake key mock');
			expect(global.decodeURIComponent).toHaveBeenCalledTimes(1);
			expect(mockDownloadService.getCertificate).toHaveBeenCalledWith('decodedS3Key', 'fake mock name');
			expect(mockDownloadService.getCertificate).toHaveBeenCalledTimes(1);
			expect(mockEmailAdapterStrategy.getStrategy).toHaveBeenCalledWith('decodedS3Key', 'some encoded certificate');
			expect(mockEmailAdapterStrategy.getStrategy).toHaveBeenCalledTimes(1);
			expect(returnedMockStrategy.sendEmail).toHaveBeenCalledWith('some encoded certificate', 'decodedS3Key');
			expect(returnedMockStrategy.sendEmail).toHaveBeenCalledTimes(1);
		});
	});
});
