/* eslint-disable jest/no-conditional-expect */
import sinon from 'sinon';
import { NotificationService } from '../../src/services/NotificationService';
import { Configuration } from '../../src/utils/Configuration';
import { DocumentTypes, IPartialParams } from '../../src/models';

describe('NotificationService', () => {
  const sandbox = sinon.createSandbox();
  beforeAll(() => {
    (Configuration as any).instance = new Configuration('../../src/config/config.yml', '../../tests/resources/mockSecrets.yml');
  });
  afterEach(() => {
    sandbox.restore();
  });

  context('sendNotification()', () => {
    it('should return appropriate data', async () => {
      const prepareUploadFake = sinon.fake.returns('pathToThings');
      const sendEmailFake = sinon.fake.resolves({ data: 'it worked' });
      const notifyClientMock = { prepareUpload: prepareUploadFake, sendEmail: sendEmailFake };
      const notificationService: NotificationService = new NotificationService(notifyClientMock);

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
        documentType: 'certificate' as unknown as DocumentTypes,
      };
      const resp = await notificationService.sendNotification(params);
      expect(resp).toBe('it worked');
      expect(prepareUploadFake.args[0]).toEqual([params.fileData, { confirmEmailBeforeDownload: false, isCsv: false }]);
    });
    it('should bubble up error if notify client prepareUpload method throws error', async () => {
      const prepareUploadFake = sinon.fake.throws('preparer: Oh No!');
      // const sendEmailFake = sinon.fake.resolves("it worked")
      const notifyClientMock = { prepareUpload: prepareUploadFake, sendEmail: null };
      const notificationService: NotificationService = new NotificationService(notifyClientMock);

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
        documentType: 'certificate' as unknown as DocumentTypes,
      };

      expect.assertions(1);
      try {
        await notificationService.sendNotification(params);
      } catch (e) {
        // @ts-ignore
        expect(e.message).toBe('preparer: Oh No!');
      }
    });
    it('should bubble up error if notify client sendEmail method throws error', async () => {
      const prepareUploadFake = sinon.fake.returns("I'm fine");
      const sendEmailFake = sinon.fake.throws('sender: Oh No!');
      const notifyClientMock = { prepareUpload: prepareUploadFake, sendEmail: sendEmailFake };
      const notificationService: NotificationService = new NotificationService(notifyClientMock);

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
        email: 'testemai@testdomain.com',
        fileData: 'certData' as any,
        shouldEmail: 'true',
        documentType: 'certificate' as unknown as DocumentTypes,
      };

      expect.assertions(1);
      try {
        await notificationService.sendNotification(params);
      } catch (e) {
        // @ts-ignore
        expect(e.message).toBe('sender: Oh No!');
      }
    });
  });
});
