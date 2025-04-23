import { S3BucketService } from '../../../src/services/S3BucketService';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';


describe('S3BucketService', () => {
	const getObjectCommandTesting = new GetObjectCommand({
		Bucket: 'fake mock bucket',
		Key: 'fake mock key',
	})
	const mockS3Client = {
		send: jest.fn().mockReturnValue(getObjectCommandTesting)
	} as unknown as S3Client;
	jest.spyOn(console, 'log').mockImplementation(() => { });
	const s3BucketService: S3BucketService = new S3BucketService(new S3Client({}));
	// @ts-ignore
	s3BucketService['s3Client'] = mockS3Client;

	describe('download()', () => {
		it('should output log, and send the GetObjectCommand into s3Client.send and return getObjectCommandTesting', async () => {
			const downloadReturnValue = await s3BucketService.download('fake mock bucket', 'fake mock key');

			expect(console.log).toHaveBeenCalledWith(`Downloading file: bucket name: fake mock bucket, key: fake mock key`);
			expect(mockS3Client.send).toHaveBeenCalledWith(expect.objectContaining({
				input: {
					Bucket: 'fake mock bucket',
					Key: 'fake mock key',
				}
			}));
			expect(downloadReturnValue).toEqual(getObjectCommandTesting);
		});
	});
});
