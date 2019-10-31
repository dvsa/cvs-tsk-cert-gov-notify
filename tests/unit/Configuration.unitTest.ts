import {Configuration} from "../../src/utils/Configuration";

describe("Configuration", () => {
  let branch: string | undefined = "";
  // @ts-ignore
  (Configuration as any).instance = new Configuration("../../src/config/config.yml", "../../tests/resources/mockSecrets.yml");
  beforeEach(() => {
    branch = process.env.BRANCH;
    process.env.BRANCH = "local";

  });
  afterEach(() => {
    process.env.BRANCH = branch;
    return;
  });

  context("getInvokeConfig", () => {
    it("returns expected config", () => {
      const invokeConfig = Configuration.getInstance().getInvokeConfig();
      expect(invokeConfig).toEqual({
        params: {
          apiVersion: "2015-03-31T00:00:00.000Z",
          endpoint: "http://localhost:3000"
        },
        functions: {
          testResults: {
            name: "cvs-svc-test-results",
            mock: "tests/resources/test-results-response.json"
          },
          techRecords: {
            name: "cvs-svc-technical-records",
            mock: "tests/resources/tech-records-response.json"
          }
        }
      });
    });
  });
});
