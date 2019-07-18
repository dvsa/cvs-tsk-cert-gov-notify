import {describe} from "mocha";
import chai, {expect} from "chai";
import {NotificationService} from "../../src/services/NotificationService";
import sinon from "sinon";
import sinonChai from "sinon-chai";
// @ts-ignore
import {NotifyClient} from "notifications-node-client";
const sandbox = sinon.createSandbox();
chai.use(sinonChai);

describe("NotificationService", () => {
    afterEach(() => {
        sandbox.restore();
    });

    context("sendNotification()", () => {
        it("should return appropriate data", async () => {
            const prepareUploadFake = sinon.fake.returns("pathToThings");
            const sendEmailFake = sinon.fake.resolves("it worked");
            const notifyClientMock = {prepareUpload: prepareUploadFake, sendEmail: sendEmailFake};
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
                    file_size: "306784"
                },
                email: "testemail@testdomain.com",
                certificate: "certData"
            };

            try {
                const resp = await notificationService.sendNotification(params);
                expect(resp).to.equal("it worked");
                expect(prepareUploadFake).to.have.been.calledWith(params.certificate);
            } catch (e) {
                expect.fail();
            }
        });
        it("should bubble up error if notify client prepareUpload method throws error", async () => {
            const prepareUploadFake = sinon.fake.throws("preparer: Oh No!");
            // const sendEmailFake = sinon.fake.resolves("it worked")
            const notifyClientMock = {prepareUpload: prepareUploadFake, sendEmail: null};
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
                    file_size: "306784"
                },
                email: "testemail@testdomain.com",
                certificate: "certData"
            };

            try {
                await notificationService.sendNotification(params);
                expect.fail();
            } catch (e) {
                expect(e.message).to.equal("preparer: Oh No!");
            }

        });
        it("should bubble up error if notify client sendEmail method throws error", async () => {
            const prepareUploadFake = sinon.fake.returns("I'm fine");
            const sendEmailFake = sinon.fake.throws("sender: Oh No!");
            const notifyClientMock = {prepareUpload: prepareUploadFake, sendEmail: sendEmailFake};
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
                    file_size: "306784"
                },
                email: "testemai@testdomain.com",
                certificate: "certData"
            };

            try {
                await notificationService.sendNotification(params);
                expect.fail();
            } catch (e) {
                expect(e.message).to.equal("sender: Oh No!");
            }
        });
    });
});
