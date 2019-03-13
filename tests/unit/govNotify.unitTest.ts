// import {describe} from "mocha";
// import {expect} from "chai";
// import {Injector} from "../../src/models/injector/Injector";
// import * as fs from "fs";
// import * as path from "path";
// import {CertificateDownloadService} from "../../src/services/CertificateDownloadService";
// import {S3BucketMockService} from "../models/S3BucketMockService";
//
// describe("gov-notify", () => {
//
//     context("CertificateDownloadService", () => {
//         S3BucketMockService.buckets.push({
//             bucketName: "cvs-signature",
//             files: ["1.base64"]
//         });
//         const certificateGenerationService: CertificateDownloadService = Injector.resolve<CertificateDownloadService>(CertificateDownloadService, [S3BucketMockService, LambdaMockService]);
//
//         context("when an MOT payload is generated", () => {
//             context("when a passing test result is read from the queue", () => {
//                 const event: any = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../resources/queue-event-pass.json"), "utf8"));
//                 const testResult: any = JSON.parse(event.Records[0].body);
//                 const expectedResult: any = {
//                     Watermark: "NOT VALID",
//                     DATA: {
//                         TestNumber: "W01A00310",
//                         TestStationPNumber: "09-4129632",
//                         TestStationName: "Abshire-Kub",
//                         CurrentOdometer: {
//                             value: 12312,
//                             unit: "kilometres"
//                         },
//                         IssuersName: "CVS Dev1",
//                         DateOfTheTest: "26.02.2019",
//                         CountryOfRegistrationCode: "gb",
//                         VehicleEuClassification: "M1",
//                         RawVIN: "XMGDE02FS0H012345",
//                         RawVRM: "BQ91YHQ",
//                         ExpiryDate: "25.02.2020",
//                         EarliestDateOfTheNextTest: "26.12.2019",
//                         SeatBeltTested: "No",
//                         SeatBeltPreviousCheckDate: "2019-02-26",
//                         SeatBeltNumber: 2,
//                         Make: "Plaxton",
//                         Model: "Tourismo",
//                         OdometerHistoryList: [
//                             {
//                                 value: 350000,
//                                 unit: "kilometres",
//                                 date: "2019-01-14"
//                             },
//                             {
//                                 value: 350000,
//                                 unit: "kilometres",
//                                 date: "2019-01-14"
//                             },
//                             {
//                                 value: 350000,
//                                 unit: "kilometres",
//                                 date: "2019-01-14"
//                             }
//                         ]
//                     },
//                     Signature: {
//                         ImageType: "png",
//                         ImageData: fs.readFileSync(path.resolve(__dirname, `../resources/signatures/1.base64`)).toString()
//                     }
//                 };
//
//                 it("should return a VTP20 payload", () => {
//                     return certificateGenerationService.generatePayload(testResult)
//                     .then((payload: any) => {
//                         expect(payload).to.eql(expectedResult);
//                     });
//                 });
//             });
//
//             context("when a failing test result is read from the queue", () => {
//                 const event: any = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../resources/queue-event-fail.json"), "utf8"));
//                 const testResult: any = JSON.parse(event.Records[0].body);
//                 const expectedResult: any = {
//                     Watermark: "NOT VALID",
//                     FAIL_DATA: {
//                         TestNumber: "W01A00310",
//                         TestStationPNumber: "09-4129632",
//                         TestStationName: "Abshire-Kub",
//                         CurrentOdometer: {
//                             value: 12312,
//                             unit: "kilometres"
//                         },
//                         IssuersName: "CVS Dev1",
//                         DateOfTheTest: "26.02.2019",
//                         CountryOfRegistrationCode: "gb",
//                         VehicleEuClassification: "M1",
//                         RawVIN: "XMGDE02FS0H012345",
//                         RawVRM: "BQ91YHQ",
//                         ExpiryDate: "07.03.2019",
//                         EarliestDateOfTheNextTest: "07.03.2019",
//                         SeatBeltTested: "No",
//                         SeatBeltPreviousCheckDate: "2019-02-26",
//                         SeatBeltNumber: 2,
//                         DangerousDefects: [
//                             "54.1.a.ii Power steering: not working correctly and obviously affects steering control. Inner Offside. Axles: 7. Asdasd"
//                         ],
//                         MinorDefects: [
//                             "54.1.d.i Power steering: reservoir is below minimum level. Outer Nearside. Axles: 7."
//                         ],
//                         AdvisoryDefects: [
//                             "5.1 Compression Ignition Engines Statutory Smoke Meter Test: null. Dasdasdccc"
//                         ],
//                         Make: "Plaxton",
//                         Model: "Tourismo",
//                         OdometerHistoryList: [
//                             {
//                                 value: 350000,
//                                 unit: "kilometres",
//                                 date: "2019-01-14"
//                             },
//                             {
//                                 value: 350000,
//                                 unit: "kilometres",
//                                 date: "2019-01-14"
//                             },
//                             {
//                                 value: 350000,
//                                 unit: "kilometres",
//                                 date: "2019-01-14"
//                             }
//                         ]
//                     },
//                     Signature: {
//                         ImageType: "png",
//                         ImageData: fs.readFileSync(path.resolve(__dirname, `../resources/signatures/1.base64`)).toString()
//                     }
//                 };
//
//                 it("should return a VTP30 payload", () => {
//                     return certificateGenerationService.generatePayload(testResult)
//                     .then((payload: any) => {
//                         expect(payload).to.eql(expectedResult);
//                     });
//                 });
//             });
//
//             context("when a prs test result is read from the queue", () => {
//                 const event: any = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../resources/queue-event-prs.json"), "utf8"));
//                 const testResult: any = JSON.parse(event.Records[0].body);
//                 const expectedResult: any = {
//                     Watermark: "NOT VALID",
//                     DATA: {
//                         TestNumber: "W01A00310",
//                         TestStationPNumber: "09-4129632",
//                         TestStationName: "Abshire-Kub",
//                         CurrentOdometer: {
//                             value: 12312,
//                             unit: "kilometres"
//                         },
//                         IssuersName: "CVS Dev1",
//                         DateOfTheTest: "26.02.2019",
//                         CountryOfRegistrationCode: "gb",
//                         VehicleEuClassification: "M1",
//                         RawVIN: "XMGDE02FS0H012345",
//                         RawVRM: "BQ91YHQ",
//                         ExpiryDate: "25.02.2020",
//                         EarliestDateOfTheNextTest: "26.12.2019",
//                         SeatBeltTested: "No",
//                         SeatBeltPreviousCheckDate: "2019-02-26",
//                         SeatBeltNumber: 2,
//                         Make: "Plaxton",
//                         Model: "Tourismo",
//                         OdometerHistoryList: [
//                             {
//                                 value: 350000,
//                                 unit: "kilometres",
//                                 date: "2019-01-14"
//                             },
//                             {
//                                 value: 350000,
//                                 unit: "kilometres",
//                                 date: "2019-01-14"
//                             },
//                             {
//                                 value: 350000,
//                                 unit: "kilometres",
//                                 date: "2019-01-14"
//                             }
//                         ]
//                     },
//                     FAIL_DATA: {
//                         TestNumber: "W01A00310",
//                         TestStationPNumber: "09-4129632",
//                         TestStationName: "Abshire-Kub",
//                         CurrentOdometer: {
//                             value: 12312,
//                             unit: "kilometres"
//                         },
//                         IssuersName: "CVS Dev1",
//                         DateOfTheTest: "26.02.2019",
//                         CountryOfRegistrationCode: "gb",
//                         VehicleEuClassification: "M1",
//                         RawVIN: "XMGDE02FS0H012345",
//                         RawVRM: "BQ91YHQ",
//                         ExpiryDate: "25.02.2020",
//                         EarliestDateOfTheNextTest: "26.12.2019",
//                         SeatBeltTested: "No",
//                         SeatBeltPreviousCheckDate: "2019-02-26",
//                         SeatBeltNumber: 2,
//                         PRSDefects: [
//                             "1.1.a A registration plate: missing. Front."
//                         ],
//                         Make: "Plaxton",
//                         Model: "Tourismo",
//                         OdometerHistoryList: [
//                             {
//                                 value: 350000,
//                                 unit: "kilometres",
//                                 date: "2019-01-14"
//                             },
//                             {
//                                 value: 350000,
//                                 unit: "kilometres",
//                                 date: "2019-01-14"
//                             },
//                             {
//                                 value: 350000,
//                                 unit: "kilometres",
//                                 date: "2019-01-14"
//                             }
//                         ]
//                     },
//                     Signature: {
//                         ImageType: "png",
//                         ImageData: fs.readFileSync(path.resolve(__dirname, `../resources/signatures/1.base64`)).toString()
//                     }
//                 };
//
//                 it("should return a PRS payload", () => {
//                     return certificateGenerationService.generatePayload(testResult)
//                     .then((payload: any) => {
//                         expect(payload).to.eql(expectedResult);
//                     });
//                 });
//             });
//
//             context("when a badly formatted test result is read from the queue", () => {
//                 const event: any = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../resources/queue-event-bad.json"), "utf8"));
//                 const testResult: any = JSON.parse(event.Records[0].body);
//                 const expectedResult: any = {
//                     Watermark: "NOT VALID",
//                     FAIL_DATA: {
//                         TestNumber: "W01A00310",
//                         TestStationPNumber: "09-4129632",
//                         TestStationName: "Abshire-Kub",
//                         CurrentOdometer: {
//                             value: 12312,
//                             unit: "kilometres"
//                         },
//                         IssuersName: "CVS Dev1",
//                         DateOfTheTest: "26.02.2019",
//                         CountryOfRegistrationCode: "gb",
//                         VehicleEuClassification: "M1",
//                         RawVIN: "XMGDE02FS0H012345",
//                         RawVRM: "BQ91YHQ",
//                         ExpiryDate: "07.03.2019",
//                         EarliestDateOfTheNextTest: "07.03.2019",
//                         SeatBeltTested: "No",
//                         SeatBeltPreviousCheckDate: "2019-02-26",
//                         SeatBeltNumber: 2,
//                         DangerousDefects: [
//                             "54.1.a.ii Power steering: not working correctly and obviously affects steering control. Inner Offside. Axles: 7. Asdasd"
//                         ],
//                         MinorDefects: [
//                             "54.1.d.i Power steering: reservoir is below minimum level. Outer Nearside. Axles: 7."
//                         ],
//                         AdvisoryDefects: [
//                             "5.1 Compression Ignition Engines Statutory Smoke Meter Test: null. Dasdasdccc"
//                         ],
//                         Make: "Plaxton",
//                         Model: "Tourismo",
//                         OdometerHistoryList: [
//                             {
//                                 value: 350000,
//                                 unit: "kilometres",
//                                 date: "2019-01-14"
//                             },
//                             {
//                                 value: 350000,
//                                 unit: "kilometres",
//                                 date: "2019-01-14"
//                             },
//                             {
//                                 value: 350000,
//                                 unit: "kilometres",
//                                 date: "2019-01-14"
//                             }
//                         ]
//                     },
//                     Signature: {
//                         ImageType: "png",
//                         ImageData: fs.readFileSync(path.resolve(__dirname, `../resources/signatures/1.base64`)).toString()
//                     }
//                 };
//
//                 it("should throw an error", () => {
//                     return certificateGenerationService.generatePayload(testResult)
//                     .then((payload: any) => {
//                         expect(payload).to.eql(expectedResult);
//                     });
//                 });
//             });
//         });
//     });
// });
