import { NotificationService } from "../../src/services/NotificationService";
import { Configuration } from "../../src/utils/Configuration";
import sinon from "sinon";
import { DocumentTypes, IPartialParams } from "../../src/models";

describe("NotificationService", () => {
  const sandbox = sinon.createSandbox();
  beforeAll(() => {
    // @ts-ignore
    (Configuration as any).instance = new Configuration("../../src/config/config.yml", "../../tests/resources/mockSecrets.yml");
  });
  afterEach(() => {
    sandbox.restore();
  });

  context("sendNotification()", () => {
    it("should return appropriate data", async () => {
      const prepareUploadFake = sinon.fake.returns("pathToThings");
      const sendEmailFake = sinon.fake.resolves({ data: "it worked" });
      const notifyClientMock = { prepareUpload: prepareUploadFake, sendEmail: sendEmailFake };
      const notificationService: NotificationService = new NotificationService(notifyClientMock);

      const params: IPartialParams = {
        personalisation: {
          vrms: "BQ91YHQ",
          test_type_name: "Annual test",
          date_of_issue: "11 March 2019",
          total_certs: "2",
          test_type_result: "prs",
          cert_type: "PSV_PRS",
          file_format: "pdf",
          file_size: "306784",
        },
        email: "testemail@testdomain.com",
        fileData: "certData",
        shouldEmail: "true",
        documentType: DocumentTypes.CERTIFICATE,
      };
      const resp = await notificationService.sendNotification(params);
      expect(resp).toEqual("it worked");
      expect(prepareUploadFake.args[0]).toEqual([params.fileData, { confirmEmailBeforeDownload: false }]);
    });
    it("should bubble up error if notify client prepareUpload method throws error", async () => {
      const prepareUploadFake = sinon.fake.throws("preparer: Oh No!");
      // const sendEmailFake = sinon.fake.resolves("it worked")
      const notifyClientMock = { prepareUpload: prepareUploadFake, sendEmail: null };
      const notificationService: NotificationService = new NotificationService(notifyClientMock);

      const params = {
        personalisation: {
          vrms: "BQ91YHQ",
          test_type_name: "Annual test",
          date_of_issue: "11 March 2019",
          total_certs: "2",
          test_type_result: "prs",
          cert_type: "PSV_PRS",
          file_format: "pdf",
          file_size: "306784",
        },
        email: "testemail@testdomain.com",
        fileData: "certData",
        shouldEmail: "true",
        documentType: DocumentTypes.CERTIFICATE,
      };

      expect.assertions(1);
      try {
        await notificationService.sendNotification(params);
      } catch (e) {
        expect(e.message).toEqual("preparer: Oh No!");
      }
    });
    it("should bubble up error if notify client sendEmail method throws error", async () => {
      const prepareUploadFake = sinon.fake.returns("I'm fine");
      const sendEmailFake = sinon.fake.throws("sender: Oh No!");
      const notifyClientMock = { prepareUpload: prepareUploadFake, sendEmail: sendEmailFake };
      const notificationService: NotificationService = new NotificationService(notifyClientMock);

      const params = {
        personalisation: {
          vrms: "BQ91YHQ",
          test_type_name: "Annual test",
          date_of_issue: "11 March 2019",
          total_certs: "2",
          test_type_result: "prs",
          cert_type: "PSV_PRS",
          file_format: "pdf",
          file_size: "306784",
        },
        email: "testemai@testdomain.com",
        fileData: "certData",
        shouldEmail: "true",
        documentType: DocumentTypes.CERTIFICATE,
      };

      expect.assertions(1);
      try {
        await notificationService.sendNotification(params);
      } catch (e) {
        expect(e.message).toEqual("sender: Oh No!");
      }
    });
  });
});
