import { Context, S3EventRecord } from 'aws-lambda';
import 'reflect-metadata';
import { EmailRequestProcessor } from '../../../src/functions/EmailRequestProcessor';
import { handler } from '../../../src/handler';
import { NotificationService } from '../../../src/services/NotificationService';
import { AxiosError } from 'axios';

describe('gov-notify', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		jest.spyOn(NotificationService.prototype, 'initializeNotifyClient').mockResolvedValue(Promise.resolve());
	});

	it('should error if there is no event records', async () => {
		const event = { foo: 'bar' };

		await expect(async () => {
			await handler(event, {} as unknown as Context, () => {});
		}).rejects.toThrow('Event is empty');
	});

	it('should error if the event records are not an array', async () => {
		const event = { Records: 'bar' };

		await expect(async () => {
			await handler(event, {} as unknown as Context, () => {});
		}).rejects.toThrow('Event is empty');
	});

	it('should call the process method once when there is one valid s3 record', async () => {
		expect.assertions(1);
		const event = { Records: ['event1'] };

		jest
			.spyOn(EmailRequestProcessor.prototype, 'getRecordS3Objects')
			.mockReturnValue([{ event: 'event1' }] as unknown as S3EventRecord['s3'][]);

		const processSpy = jest
			.spyOn(EmailRequestProcessor.prototype, 'process')
			.mockImplementation(() => Promise.resolve());

		await handler(event, {} as unknown as Context, () => {});

		expect(processSpy).toHaveBeenCalledTimes(1);
	});

	it('should call the process method twice when there is two valid s3 records', async () => {
		expect.assertions(1);
		const event = { Records: ['event1'] };

		jest
			.spyOn(EmailRequestProcessor.prototype, 'getRecordS3Objects')
			.mockReturnValue([{ event: 's3Record1' }, { event: 's3Record2' }] as unknown as S3EventRecord['s3'][]);

		const processSpy = jest
			.spyOn(EmailRequestProcessor.prototype, 'process')
			.mockImplementation(() => Promise.resolve());

		await handler(event, {} as unknown as Context, () => {});

		expect(processSpy).toHaveBeenCalledTimes(2);
	});

	it('should have one partial batch failure when two records but only one fails', async () => {
		expect.assertions(2);
		const event = { Records: ['event1', 'event2'] };

		jest
			.spyOn(EmailRequestProcessor.prototype, 'getRecordS3Objects')
			.mockReturnValue([{ event: 's3Record1' }] as unknown as S3EventRecord['s3'][]);

		const processSpy = jest.spyOn(EmailRequestProcessor.prototype, 'process');
		processSpy.mockImplementationOnce(() => Promise.resolve());
		processSpy.mockImplementationOnce(() => Promise.reject());

		const res = await handler(event, {} as unknown as Context, () => {});

		expect(processSpy).toHaveBeenCalledTimes(2);
		expect(res.batchItemFailures.length).toBe(1);
	});
	it('should have two partial batch failures when two records and both fail', async () => {
		expect.assertions(2);
		const event = { Records: ['event1', 'event2'] };

		jest
			.spyOn(EmailRequestProcessor.prototype, 'getRecordS3Objects')
			.mockReturnValue([{ event: 's3Record1' }] as unknown as S3EventRecord['s3'][]);

		const processSpy = jest.spyOn(EmailRequestProcessor.prototype, 'process');
		processSpy.mockImplementation(() => Promise.reject());

		const res = await handler(event, {} as unknown as Context, () => {});

		expect(processSpy).toHaveBeenCalledTimes(2);
		expect(res.batchItemFailures.length).toBe(2);
	});
  it('should catch error of type AxiosError without data if it is thrown', async () => {
    expect.assertions(1);
    const event = { Records: ['event1'] };

    jest
      .spyOn(EmailRequestProcessor.prototype, 'getRecordS3Objects')
      .mockReturnValue([{ event: 's3Record1' }] as unknown as S3EventRecord['s3'][]);

    jest.spyOn(EmailRequestProcessor.prototype, 'process').mockImplementation(() => {
      const error = new Error('Mock Axios Error') as AxiosError;
      error.isAxiosError = true;
      throw error;
    });

    const consoleSpy = jest.spyOn(console, 'error');

    await handler(event, {} as unknown as Context, () => {});

    expect(consoleSpy).toHaveBeenCalledWith('ERROR: Axios response error', undefined);
  });
  it('should catch error of type AxiosError with data if it is thrown', async () => {
    expect.assertions(1);
    const event = { Records: ['event1'] };

    jest
      .spyOn(EmailRequestProcessor.prototype, 'getRecordS3Objects')
      .mockReturnValue([{ event: 's3Record1' }] as unknown as S3EventRecord['s3'][]);

    jest.spyOn(EmailRequestProcessor.prototype, 'process').mockImplementation(() => {
      const error = new Error('Mock Axios Error') as AxiosError;
      error.isAxiosError = true;
      error.response = { data: "some data", status: 400, statusText: "Bad Request", headers: {}, config: {} } as AxiosError['response'];
      throw error;
    });

    const consoleSpy = jest.spyOn(console, 'error');

    await handler(event, {} as unknown as Context, () => {});

    expect(consoleSpy).toHaveBeenCalledWith('ERROR: Axios response error', "some data");
  });
});
