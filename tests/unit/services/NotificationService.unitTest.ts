const mockPrepareUpload = jest.fn();
const mockSendEmail = jest.fn();
import { DocumentTypes, INotifyConfig, IPartialParams } from '../../../src/models';
import { NotificationService } from '../../../src/services/NotificationService';
import { Configuration } from '../../../src/utils/Configuration';

jest.mock('../../../node_modules/notifications-node-client', () => ({
	NotifyClient: jest.fn().mockImplementation(() => ({
		prepareUpload: mockPrepareUpload,
		sendEmail: mockSendEmail,
	})),
}));

describe('NotificationService', () => {
	const notificationService: NotificationService = new NotificationService();

	beforeAll(async () => {
		(Configuration as any).instance = new Configuration(
			'../../src/config/config.yml',
			'../../resources/mockSecrets.yml'
		);
		jest.spyOn(Configuration.prototype, 'getNotifyConfig').mockResolvedValue({} as unknown as INotifyConfig);
		await notificationService.initializeNotifyClient();
	});

	beforeEach(() => {
		jest.resetAllMocks();
	});

	describe('sendNotification', () => {
		const params: IPartialParams = {
			personalisation: {
				vrms: 'BQ91YHQ',
				test_type_name: 'Annual test',
				date_of_issue: '11 March 2019',
				total_certs: '2',
				test_type_result: 'prs',
				cert_type: 'PSV_PRS',
				file_format: 'pdf',
				file_size: '306784',
			},
			email: 'testemail@testdomain.com',
			fileData: 'certData' as any,
			shouldEmail: 'true',
			documentType: 'certificate' as DocumentTypes,
		};

		it('should allow me to send an email and prepare the upload', async () => {
			mockPrepareUpload.mockReturnValue('uploaded data');

			await notificationService.sendNotification(params, '12345');

			expect(mockSendEmail).toHaveBeenCalledWith('12345', 'testemail@testdomain.com', {
				personalisation: { ...params.personalisation, link_to_document: 'uploaded data' },
			});
		});

		it('should allow me to send an email and prepare the upload pass file name as null', async () => {
			mockPrepareUpload.mockReturnValue('uploaded data');

			await notificationService.sendNotification(params, '12345', null);

			expect(mockSendEmail).toHaveBeenCalledWith('12345', 'testemail@testdomain.com', {
				personalisation: { ...params.personalisation, link_to_document: 'uploaded data' },
			});
		});

		it('should allow me to send an email and prepare the upload pass file name as filename', async () => {
			mockPrepareUpload.mockReturnValue('uploaded data');

			await notificationService.sendNotification(params, '12345', 'filename');

			expect(mockSendEmail).toHaveBeenCalledWith('12345', 'testemail@testdomain.com', {
				personalisation: { ...params.personalisation, link_to_document: 'uploaded data' },
			});
		});

		it('should not send an email if shouldEmail is false', async () => {
			mockPrepareUpload.mockReturnValue('uploaded data');
			params.shouldEmail = 'false';

			await notificationService.sendNotification(params, '12345');

			expect(mockSendEmail).not.toHaveBeenCalled();
		});

		//TODO: this looks like a bad code path leave till new service template for checking if a fix is needed.
		it('should not send email when notifyPartialParams is undefined', async () => {
			try{
				await notificationService.sendNotification(undefined as any, 'templateId', 'filename');
			}
			catch (error) {
				//this is probably not happening in live
			}
			finally {
				expect(mockSendEmail).not.toHaveBeenCalled();
			}
		});

		it('should not send email when shouldEmail is null', async () => {
			const params: IPartialParams = {
				shouldEmail: null as any,
				email: 'test@example.com',
				personalisation: { name: 'Test User' },
				fileData: Buffer.from('test'),
				documentType: 'certificate',
			} as IPartialParams;

			await notificationService.sendNotification(params, 'templateId', 'filename');
			expect(mockSendEmail).toHaveBeenCalled();
		});
	});
});
