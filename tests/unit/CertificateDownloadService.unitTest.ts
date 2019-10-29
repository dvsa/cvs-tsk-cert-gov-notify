import {Injector} from "../../src/models/injector/Injector";
import * as fs from "fs";
import * as path from "path";
import {CertificateDownloadService} from "../../src/services/CertificateDownloadService";
import {S3BucketMockService} from "../models/S3BucketMockService";
import sinon from "sinon";
// @ts-ignore
import {NotifyClient} from "notifications-node-client";
const sandbox = sinon.createSandbox();

describe("CertificateDownloadService", () => {
    beforeAll(()  => {
        process.env.BUCKET = "local";
    });
    afterEach(() => {
        sandbox.restore();
    });

    S3BucketMockService.buckets.push({
        bucketName: "cvs-cert-local",
        files: ["1_1B7GG36N12S678410_1.base64"]
    });
    S3BucketMockService.setMetadata({
        "vrm": "BQ91YHQ",
        "test-type-name": "Annual test",
        "date-of-issue": "11 March 2019",
        "total-certs": "2",
        "test-type-result": "prs",
        "cert-type": "PSV_PRS",
        "cert-index": "1",
        "file-format": "pdf",
        "file-size": "306784",
        "email": "testemail@testdomain.com"
    });
    const certificateDownloadService: CertificateDownloadService = Injector.resolve<CertificateDownloadService>(CertificateDownloadService, [S3BucketMockService]);

    context("getCertificate()", () => {
        it("should return appropriate data", async () => {
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

            const response = await certificateDownloadService.getCertificate("1_1B7GG36N12S678410_1.base64");
            expect(response).toEqual(expectedResponse);
        });
        it("should bubble up error from S3 Client", async () => {
            // Remove bucket so download fails
            S3BucketMockService.buckets.pop();
            expect.assertions(1);
            try {
                await certificateDownloadService.getCertificate("1_1B7GG36N12S678410_1.base64");
            } catch (e) {
                expect(e.message).toEqual("The specified bucket does not exist.");
            }
        });
    });

    context("cleanForLogging", () => {
        it("strips out garbage (with $response)", () => {
            const input = {
                Body: "not empty",
                $response: {thing: "also not empty"},
                Survives: true
            };
            const expectedOutput = {
                Body: {redacted: true},
                Survives: true
            };
            const response = certificateDownloadService.cleanForLogging(input);
            expect(response).toEqual(expectedOutput);
        });

        it("strips out garbage (without $response)", () => {
            const input = {
                Body: "not empty",
                Survives: true
            };
            const expectedOutput = {
                Body: {redacted: true},
                Survives: true
            };
            const response = certificateDownloadService.cleanForLogging(input);
            expect(response).toEqual(expectedOutput);
        });
    });
});
