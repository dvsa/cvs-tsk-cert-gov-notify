import {
	GetSecretValueCommandInput,
	GetSecretValueCommandOutput,
	SecretsManager,
} from '@aws-sdk/client-secrets-manager';
import AWSXRay from 'aws-xray-sdk';
import { load } from 'js-yaml';
/* eslint-disable security/detect-object-injection */
// @ts-ignore
import * as yml from 'node-yaml';
import { ERRORS } from '../assets/enum';
import { IConfig, IInvokeConfig, INotifyConfig, IS3Config } from '../models';

/**
 * Configuration class for retrieving project config
 */
class Configuration {
	private static instance: Configuration;

	private readonly config: IConfig;

	private readonly secretPath: string;

	private secretsClient: SecretsManager;

	constructor(configPath: string, secretsPath: string) {
		this.secretsClient = AWSXRay.captureAWSv3Client(
			new SecretsManager({
				region: 'eu-west-1',
			})
		);
		this.secretPath = secretsPath;
		const config = yml.readSync(configPath);

		// Replace environment variable references
		let sConfig: string = JSON.stringify(config);
		// eslint-disable-next-line security/detect-unsafe-regex
		const envRegex: RegExp = /\${(\w+\b):?(\w+\b)?}/g;
		const matches: RegExpMatchArray | null = sConfig.match(envRegex);

		if (matches) {
			matches.forEach((match: string) => {
				envRegex.lastIndex = 0;
				const captureGroups: RegExpExecArray = envRegex.exec(match) as RegExpExecArray;

				// Insert the environment variable if available. If not, insert placeholder. If no placeholder, leave it as is.
				sConfig = sConfig.replace(match, process.env[captureGroups[1]] || captureGroups[2] || captureGroups[1]);
			});
		}
		this.config = JSON.parse(sConfig);
	}

	/**
	 * Retrieves the singleton instance of Configuration
	 * @returns Configuration
	 */
	public static getInstance(): Configuration {
		if (!this.instance) {
			this.instance = new Configuration('../config/config.yml', '../config/secrets.yml');
		}

		return Configuration.instance;
	}

	/**
	 * Retrieves the Lambda Invoke config
	 * @returns IInvokeConfig
	 */
	public getInvokeConfig(): IInvokeConfig {
		if (!this.config.invoke) {
			throw new Error(ERRORS.LambdaInvokeConfigNotDefined);
		}

		// Not defining BRANCH will default to local
		const env: string = !process.env.BRANCH || process.env.BRANCH === 'local' ? 'local' : 'remote';

		return this.config.invoke[env];
	}

	/**
	 * Retrieves the S3 config
	 * @returns IS3Config
	 */
	public getS3Config(): IS3Config {
		if (!this.config.s3) {
			throw new Error(ERRORS.DynamoDBConfigNotDefined);
		}

		// Not defining BRANCH will default to local
		const env: string = !process.env.BRANCH || process.env.BRANCH === 'local' ? 'local' : 'remote';

		return this.config.s3[env];
	}

	/**
	 * Retrieves the MOT config
	 * @returns INotifyConfig
	 */
	public async getNotifyConfig(): Promise<INotifyConfig> {
		if (!this.config.notify) {
			throw new Error(ERRORS.NotifyConfigNotDefined);
		}
		if (!this.config.notify.api_key) {
			await this.setSecrets();
		}

		return this.config.notify;
	}

	/**
	 * Sets the secrets needed to use GovNotify
	 * @returns Promise<void>
	 */
	private async setSecrets(): Promise<void> {
		let secretConfig: any;

		if (process.env.SECRET_NAME) {
			const secretRequest: GetSecretValueCommandInput = {
				SecretId: process.env.SECRET_NAME,
			};
			const resp: GetSecretValueCommandOutput = await this.secretsClient.getSecretValue(secretRequest);
			try {
				secretConfig = load(resp.SecretString as string);
			} catch (e) {
				throw new Error('SecretString is empty.');
			}
		} else {
			console.warn(ERRORS.SECRET_ENV_VAR_NOT_EXIST);
			try {
				secretConfig = await yml.read(this.secretPath);
			} catch (err) {
				throw new Error(ERRORS.SECRET_FILE_NOT_EXIST);
			}
		}
		try {
			this.config.notify.api_key = secretConfig.notify.api_key;
		} catch (e) {
			throw new Error('secretConfig not set');
		}
	}
}

export { Configuration };
