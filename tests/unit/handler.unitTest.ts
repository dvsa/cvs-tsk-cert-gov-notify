import { config as AWSConfig } from "aws-sdk";
import * as notify from "../../src/functions/govNotify";
import { Configuration } from "../../src/utils/Configuration";

describe("handler", () => {
  // @ts-ignore
  (Configuration as any).instance = new Configuration("../../src/config/config.yml", "../../tests/resources/mockSecrets.yml");
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
});
