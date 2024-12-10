const mockPrepareUpload = jest.fn();
const mockSendEmail = jest.fn();
import { DocumentTypes, INotifyConfig, IPartialParams } from '../../../src/models';
import { NotificationService } from '../../../src/services/NotificationService';
import { Configuration } from '../../../src/utils/Configuration';

jest.mock("../../../node_modules/notifications-node-client", () => ({
  NotifyClient: jest.fn().mockImplementation(() => ({
    prepareUpload: mockPrepareUpload,
    sendEmail: mockSendEmail,
  })),
}));


describe('NotificationService', () => {
  const notificationService: NotificationService = new NotificationService();

  beforeAll(async () => {
    (Configuration as any).instance = new Configuration('../../src/config/config.yml', '../../resources/mockSecrets.yml');
    jest.spyOn(Configuration.prototype, 'getNotifyConfig').mockResolvedValue({} as unknown as INotifyConfig)
    await notificationService.initializeNotifyClient();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  })

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

    it('should allow me to send an email and prepare the upload with csv = true', async () => {
      mockPrepareUpload.mockReturnValue('uploaded data');

      await notificationService.sendNotification(params);

      expect(mockSendEmail).toHaveBeenCalledWith('ff36dae2-937e-4883-9e25-e776fa6af665', 'testemail@testdomain.com',
       { personalisation: {...params.personalisation, link_to_document: 'uploaded data'}});
    });

    it('should allow me to send an email and prepare the upload', async () => {
      mockPrepareUpload.mockReturnValue('uploaded data');

      await notificationService.sendNotification(params, true);

      expect(mockSendEmail).toHaveBeenCalledWith('ff36dae2-937e-4883-9e25-e776fa6af665', 'testemail@testdomain.com',
       { personalisation: {...params.personalisation, link_to_document: 'uploaded data'}});
    });

    it('should not send an email if shouldEmail is false', async () => {
      mockPrepareUpload.mockReturnValue('uploaded data');
      params.shouldEmail = 'false';

      await notificationService.sendNotification(params, true);

      expect(mockSendEmail).not.toHaveBeenCalled();
    });
  });
});
