import lambdaTester from "lambda-tester";
import {handler} from "../../src/handler";
import {Configuration} from "../../src/utils/Configuration";
import {CertificateDownloadService} from "../../src/services/CertificateDownloadService";
import {NotificationService} from "../../src/services/NotificationService";

describe("gov-notify", () => {
  const event = {
    Records: [
      {
        messageId: "e982f6d5-750b-4a51-a970-1c28069264f1",
        receiptHandle: "AQEBDmMTvZ3clvltGoZSOHzwdYPXfCrWcpGUvDBgaq2E7tzL4/c5gfEzihpKb01ZRCnL2ovPZyDctFVWySBvxCs+jpnqQV9UkT+rev2iF6pQHFeVIfVtAKMWhAN4v2Xq1DocTMwOeOjhcD5HJZV0n1Ubojp8TQ2zO/dr0IAigkwSEEAN+edaoRZZfciC/xQa22mhWwqrpqeIY14xFesqAH7vGiTUz5vO1rqM/pNV1QdgT68imIokF5v2WtAsRv3PJ3RXhMAbDiVeSHMcvEEsXDDrjwP3MGW+ft8RUsITrLsCMbViZ5b2NQUrem7mwM71yUlidrPvwZWjoGqin5S99SjYaPZhHoq5BKLY+WSy1vx2QzP8Q2BwcsmcYiAbW86HOHFBkS009GPwDm7Yw88Uy/MVMQ==",
        body: "{\"Records\":[{\"eventVersion\":\"2.1\",\"eventSource\":\"aws:s3\",\"awsRegion\":\"eu-west-2\",\"eventTime\":\"2019-03-11T17:25:49.423Z\",\"eventName\":\"ObjectCreated:Put\",\"userIdentity\":{\"principalId\":\"AWS:AROAI6VHAEV7JDO4TV7SW:cvs-tsk-cert-gen\"},\"requestParameters\":{\"sourceIPAddress\":\"35.177.22.7\"},\"responseElements\":{\"x-amz-request-id\":\"E3EC1ADCF9837A04\",\"x-amz-id-2\":\"94WFwtqptVMLLnjxdYEnZTk6Ckvxd/kc955n6FobhewQnZLaa6j2mYsN5FhAXAK5GMCEAYMTw5s=\"},\"s3\":{\"s3SchemaVersion\":\"1.0\",\"configurationId\":\"NewCertificateEvent\",\"bucket\":{\"name\":\"cvs-cert-local\",\"ownerIdentity\":{\"principalId\":\"A1MIGBS2LU0NRP\"},\"arn\":\"arn:aws:s3:::cvs-cert\"},\"object\":{\"key\":\"1_1B7GG36N12S678410_1.pdf\",\"size\":306696,\"eTag\":\"eb29a2eaf5c2cfc08beb9158dc9fec1a\",\"sequencer\":\"005C869A1D5F16042D\"}}}]}",
        attributes: {
          ApproximateReceiveCount: "1",
          SentTimestamp: "1552325149579",
          SenderId: "AIDAIKZTX7KCMT7EP3TLW",
          ApproximateFirstReceiveTimestamp: "1552325149580"
        },
        messageAttributes: {},
        md5OfBody: "d8e8e36efee1d59ffc9e58abb3957b79",
        eventSource: "aws:sqs",
        eventSourceARN: "arn:aws:sqs:eu-west-2:006106226016:gov-notify-q",
        awsRegion: "eu-west-2"
      }
    ]
  };
  beforeAll(() => {
    process.env.BUCKET = "local";
    delete process.env.SECRET_NAME;
    // @ts-ignore
    (Configuration as any).instance = new Configuration("../../src/config/config.yml", "../../tests/resources/mockSecrets.yml");
  });
  context("handler", () => {
    context("when the request is valid", () => {
      it("response should resolve ", () => {
        CertificateDownloadService.prototype.getCertificate = jest.fn().mockResolvedValue("");
        NotificationService.prototype.sendNotification = jest.fn().mockResolvedValue({
          body: {
            content: {
              from_email: "commercial.vehicle.services@notifications.service.gov.uk",
              subject: "BQ91YHQ Annual test|11 March 2019 (Certificate 1 of 2)",
            }
          }
        });
        return lambdaTester(handler)
          .event(event)
          .expectResolve((result: any) => {
            delete result[0].body.content.body;
            expect(result[0].body.content).toEqual({
              from_email: "commercial.vehicle.services@notifications.service.gov.uk",
              subject: "BQ91YHQ Annual test|11 March 2019 (Certificate 1 of 2)"
            });
          });
      });

      context("and the S3 metadata object has shouldSendCertificate set to true", () => {
        it("should call the sendNotification function and send", () => {
          CertificateDownloadService.prototype.getCertificate = jest.fn().mockResolvedValue({shouldEmailCertificate: "true"});
          NotificationService.prototype.sendNotification = jest.fn().mockResolvedValue("sent notification");
          return lambdaTester(handler)
            .event(event)
            .expectResolve((result: any) => {
              expect(result[0]).toEqual("sent notification");
              expect(NotificationService.prototype.sendNotification).toHaveBeenCalled();
            });
        });
      });

      context("and the S3 metadata object doesn't have shouldSendCertificate property", () => {
        it("should call the sendNotification function", () => {
          CertificateDownloadService.prototype.getCertificate = jest.fn().mockResolvedValue({shouldEmailCertificate: "true"});
          NotificationService.prototype.sendNotification = jest.fn().mockResolvedValue("sent notification");
          return lambdaTester(handler)
            .event(event)
            .expectResolve((result: any) => {
              expect(result[0]).toEqual("sent notification");
              expect(NotificationService.prototype.sendNotification).toHaveBeenCalled();
            });
        });
      });

      context("and the S3 metadata object has shouldSendCertificate set to false", () => {
        it("should call the sendNotification function", () => {
          CertificateDownloadService.prototype.getCertificate = jest.fn().mockResolvedValue({shouldEmailCertificate: "false"});
          NotificationService.prototype.sendNotification = jest.fn().mockResolvedValue("sent notification");
          return lambdaTester(handler)
            .event(event)
            .expectResolve((result: any) => {
              expect(result[0]).toEqual(undefined);
              expect(NotificationService.prototype.sendNotification).not.toHaveBeenCalled();
            });
        });
      });
    });

    context("when the request is not valid", () => {
      it("response should reject ", () => {
        // @ts-ignore
        return lambdaTester(handler)
          .event(undefined)
          .expectReject((result: Error) => {
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toEqual("Event is empty");
          });
      });
    });
  });
});
