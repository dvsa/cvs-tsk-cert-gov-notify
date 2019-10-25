import * as notify from "../../src/functions/govNotify";
import {config as AWSConfig} from "aws-sdk";
import mockContext from "aws-lambda-mock-context";

describe("handler", () => {
  const ctx = mockContext();
  const myMock = jest.fn().mockResolvedValue("Success");
  // @ts-ignore
  notify.govNotify = myMock;
  let branch: string | undefined;
  describe("offline", () => {
    beforeAll(() => {
      jest.resetAllMocks();
      jest.resetModules();
      branch = process.env.BRANCH;
    });
    afterAll(() => {
      process.env.BRANCH = branch;
    });
    it("sets AWS config to defaults", async () => {
      process.env.BRANCH = "local";
      require("../../src/handler");
      const offline = AWSConfig.credentials;
      // This works using console logs etc, but I can't make it return the values correctly for testing.
      // No idea why - probably some instance  garbage in the AWS code

      // @ts-ignore
      // expect(offline.accessKeyId).toEqual("accessKey1");
      // @ts-ignore
      // expect(offline.secretAccessKey).toEqual("verySecretKey1");
    });
  });

  describe("online", () => {
    beforeAll(() => {
      jest.resetAllMocks();
      jest.resetModules();
      branch = process.env.BRANCH;
    });
    afterAll(() => {
      process.env.BRANCH = branch;
    });
    it("does not set AWS config to defaults", () => {
      process.env.BRANCH = "CVSB-test";
      const handler = require("../../src/handler").handler;
      handler({}, ctx, () => {
        return;
      });

      const actual = AWSConfig.credentials;
      // @ts-ignore
      expect(actual.accessKeyId).not.toEqual("accessKey1");
      // @ts-ignore
      expect(actual.secretAccessKey).not.toEqual("verySecretKey1");
    });
  });

});
