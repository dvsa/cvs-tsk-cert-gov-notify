import {describe} from "mocha";
import {expect} from "chai";
import {Configuration} from "../../src/utils/Configuration";
import {IS3Config, IInvokeConfig, INotifyConfig} from "../../src/models";

describe("ConfigurationUtil", function() {
    this.timeout(10000); // 10 second timeout for setup
    const config: Configuration = Configuration.getInstance();
    const branch = process.env.BRANCH;
    context("when calling the getS3Config() and the BRANCH environment variable is local", () => {
        process.env.BRANCH = "local";
        const s3config: IS3Config = config.getS3Config();
        it("should return the local S3 config", () => {
            expect(s3config.endpoint).to.equal("http://localhost:7000");
        });
    });

    context("when calling the getS3Config() and the BRANCH environment variable is not defined", () => {
        process.env.BRANCH = "";
        const s3config: IS3Config = config.getS3Config();
        it("should return the local S3 config", () => {
            expect(s3config.endpoint).to.equal("http://localhost:7000");
        });
    });

    context("when calling the getS3Config() and the BRANCH environment variable is different than local", () => {
        process.env.BRANCH = "test";
        const s3config: IS3Config = config.getS3Config();
        it("should return empty config", () => {
            // tslint:disable-next-line:no-unused-expression
            expect(s3config).to.be.empty;
        });
    });

    context("when calling getConfig() and config file is present", () => {
        it("should return config instance", () => {
            const configInstance: any = config.getConfig();
            expect(configInstance).not.eql(undefined);
        });
    });

    context("when calling getNotifyConfig() and notify label is present in config file", () => {
        it("should return the notifyConfig", () => {
            const notifyConfigInstance: INotifyConfig = config.getNotifyConfig();
            expect(notifyConfigInstance).not.eql(undefined);
        });
    });
    context("when calling getInvokeConfig() and the BRANCH environment variable is not defined", () => {
        it("should return local invokeConfig", () => {
            process.env.BRANCH = "";
            const invokeConfigInstance: IInvokeConfig = config.getInvokeConfig();
            expect(invokeConfigInstance.params.endpoint).to.not.be.eql(undefined);
            expect(invokeConfigInstance.params.endpoint).to.be.eql("http://localhost:3000");
        });
    });
    context("when calling getInvokeConfig() and the BRANCH environment variable is local", () => {
        it("should return local invokeConfig", () => {
            process.env.BRANCH = "local";
            const invokeConfigInstance: IInvokeConfig = config.getInvokeConfig();
            expect(invokeConfigInstance.params.endpoint).to.not.be.eql(undefined);
            expect(invokeConfigInstance.params.endpoint).to.be.eql("http://localhost:3000");
        });
    });
    process.env.BRANCH = branch;
});
