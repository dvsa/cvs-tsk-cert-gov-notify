import { Context } from 'aws-lambda';
import "reflect-metadata";
import Container from 'typedi';
import { handler } from '../../../src/handler';
import { S3BucketService } from '../../../src/services/S3BucketService';
import { S3BucketMockService } from '../../models/S3BucketMockService';

describe('gov-notify', () => {
  Container.set(S3BucketService, new S3BucketMockService());

  beforeEach(() => {
    jest.resetAllMocks();
  })

 it('should error if there is no event records', async () => {
   const event = { foo: 'bar'};

   expect(async () => {
    await handler(event, {} as unknown as Context, () => {});
   }).rejects.toThrow('Event is empty');
 })

 it('should error if the event records are not an array', async () => {
  const event = { Records: 'bar'};

  expect(async () => {
   await handler(event, {} as unknown as Context, () => {});
  }).rejects.toThrow('Event is empty');
 })

//  it('should call the process method once when there is one valid s3 record', async () => {
//   expect.assertions(1);
//   const event = { Records: ['event1', 'event2'] }

//   jest.spyOn(EmailRequestProcessor.prototype, 'getRecordS3Objects').mockReturnValue(
//     [{event: 'event1'}] as unknown as S3EventRecord['s3'][]
//   )

//   const processSpy = jest.spyOn(EmailRequestProcessor.prototype, 'process').mockImplementation(() => {
//     return Promise.resolve();
//   })

//   await handler(event, {} as unknown as Context, () => {});

//   expect(processSpy).toHaveBeenCalledTimes(1);
//  })
//  it('should call the process method twice when there is two valid s3 records')
//  it('should have one partial batch failure when two records but only one fails')
//  it('should have two partial batch failures when two records and both fail')
});
