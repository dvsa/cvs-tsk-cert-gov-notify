import { SQSRecord } from 'aws-lambda';
import 'reflect-metadata';
import { EmailRequestProcessor } from '../../../src/functions/EmailRequestProcessor';
import { CertificateDownloadService } from '../../../src/services/CertificateDownloadService';
import { EmailAdapterStrategy } from '../../../src/services/EmailAdapterStrategy';

describe('Email Request Processors', () => {
	const emailRequestProcess = new EmailRequestProcessor(
		jest.fn() as unknown as EmailAdapterStrategy,
		jest.fn() as unknown as CertificateDownloadService
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
});
