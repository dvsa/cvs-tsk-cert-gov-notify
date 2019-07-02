import {describe} from "mocha";
import {expect} from "chai";
import {Injector} from "../../src/models/injector/Injector";
import * as fs from "fs";
import * as path from "path";
import {CertificateDownloadService} from "../../src/services/CertificateDownloadService";
import {S3BucketMockService} from "../models/S3BucketMockService";
import {NotificationService} from "../../src/services/NotificationService";
import {NotifyClientMock} from "../models/NotifyClientMock";
import {HTTPError} from "../../src/models/HTTPError";

describe("gov-notify", function() {
    this.timeout(10000); // 10 second timeout for setup
    const certificateDownloadService: CertificateDownloadService = Injector.resolve<CertificateDownloadService>(CertificateDownloadService, [S3BucketMockService]);
    S3BucketMockService.buckets.push({
            bucketName: "cvs-cert-local",
            files: ["1_1B7GG36N12S678410_1.base64"]
        });
    S3BucketMockService.metadata = {
            "cert-type": "PSV_PRS",
            "date-of-issue": "11 March 2019",
            "file-format": "pdf",
            "file-size": "306784",
            "cert-index": "1",
            "test-type-name": "Annual test",
            "test-type-result": "prs",
            "total-certs": "2",
            "vrm": "BQ91YHQ",
            "email": "testemail@testdomain.com"
        };
    context("CertificateDownloadService", () => {
        context("getCertificate() with valid file name", () => {
            it("should return apropriate data", () => {


            const expectedResponse = {
                    personalisation: {
                        vrms: "BQ91YHQ",
                        test_type_name: "Annual test",
                        date_of_issue: "11 March 2019",
                        total_certs: "2",
                        test_type_result: "prs",
                        cert_type: "PSV_PRS",
                        cert_index: "1",
                        file_format: "pdf",
                        file_size: "306784"
                    },
                    email: "testemail@testdomain.com",
                    certificate: fs.readFileSync(path.resolve(__dirname, `../resources/certificates/base64/1_1B7GG36N12S678410_1.base64`))
                };

            certificateDownloadService.getCertificate("1_1B7GG36N12S678410_1.base64")
                .then((response) => {
                    expect(response).to.eql(expectedResponse);
            });
            });
        });

        context("getCertificate() with invalid file name", () => {
            it("should throw error", () => {
                certificateDownloadService.getCertificate("invalid.base64")
                    .catch((error) => {
                        expect(error instanceof HTTPError).to.eql(true);
                    });
            });
        });
    });

    context("NotificationService", () => {
        const notifyClient = new NotifyClientMock("random key");
        const notificationService: NotificationService = new NotificationService(notifyClient);
        context("sendNotification() and notify client responds ok", () => {
            it("should return apropriate data", () => {
            NotifyClientMock.prepareUploadResponseFile = fs.readFileSync(path.resolve(__dirname, `../resources/certificates/base64/1_1B7GG36N12S678410_1.base64`));

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
                certificate: fs.readFileSync(path.resolve(__dirname, `../resources/certificates/base64/1_1B7GG36N12S678410_1.base64`))
            };

            const expectedResponseBody = {
                body: {
                    content: {
                        body: "Please see the link below to access the test certificate for vehicle(s) BQ91YHQ conducted on  11 March 2019\r\n\r\nhttps://documents.service.gov.uk/d/vCpIdzyaTQ6ia4xwEKvozQ/I6u9a50YSmOfW5lEZ2hfyw?key=" +
                            "VvpAYmGOFN3L1wYLW3i13zVty3TFWDM-_3KyUSOtqrY\r\nprs certificate for Annual test (PSV_PRS)(pdf,306784)\r\n\r\nWe ask that Vehicle Standards Assessors do not keep certificates on their laptops, to remain c" +
                            "ompliant with the GeneralData Protection Regulation (GDPR).\r\n\r\nIf any of the certificate details are incorrect, please use the following contacts:\r\n\r\nVehicle Standards Assessors: the retro key t" +
                            "eam or your TTL\n\nAll otherrecipients: enquiries@dvsa.gov.uk or call 0300 123 9000.\r\n\r\nDVSA (Driver and Vehicle Standards Agency)",
                        from_email: "commercial.vehicle.services@notifications.service.gov.uk",
                        subject: "BQ91YHQ Annual test|11 March 2019 (Certificate 1 of 2)"
                    },
                    id: "e5bb37e8-f95f-4003-8b39-846a03dcb9cb",
                    reference: null,
                    scheduled_for: null,
                    template: {
                        id: "1b602e0e-b53a-452a-858f-c5831ef3ed70",
                        uri: "https://api.notifications.service.gov.uk/services/bc2a4877-3c9a-4d0e-a26b-8c7010abe8cd/templates/1b602e0e-b53a-452a-858f-c5831ef3ed70",
                        version: 11
                    },
                    uri: "https://api.notifications.service.gov.uk/v2/notifications/e5bb37e8-f95f-4003-8b39-846a03dcb9cb"
                }
            };

            NotifyClientMock.sendEmailResponse = expectedResponseBody;


            notificationService.sendNotification(params)
                .then((response: any) => {
                    expect(response).to.eql(expectedResponseBody);
            });
        });
        });

        context("sendNotification() and notify client throws error", () => {
            it("should throw error", () => {
                NotifyClientMock.prepareUploadResponseFile = fs.readFileSync(path.resolve(__dirname, `../resources/certificates/base64/1_1B7GG36N12S678410_1.base64`));

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
                    certificate: fs.readFileSync(path.resolve(__dirname, `../resources/certificates/base64/1_1B7GG36N12S678410_1.base64`))
                };

                NotifyClientMock.failFlagSendEmailResponse = true;
                NotifyClientMock.sendEmailResponse = new Error("Email failed to be sent");


                notificationService.sendNotification(params)
                    .catch((error: any) => {
                        expect(error instanceof HTTPError).to.eql(true);
                    });
            });
        });
    });
});
