export enum ERRORS {
	NotifyConfigNotDefined = 'The Notify config is not defined in the config file.',
	DynamoDBConfigNotDefined = 'DynamoDB config is not defined in the config file.',
	LambdaInvokeConfigNotDefined = 'Lambda Invoke config is not defined in the config file.',
	EventIsEmpty = 'Event is empty',
	SECRET_ENV_VAR_NOT_EXIST = 'SECRET_NAME environment variable does not exist.',
	TEMPLATE_ID_ENV_VAR_NOT_EXIST = 'TEMPLATE_ID environment variable does not exist.',
	SECRET_FILE_NOT_EXIST = 'The secret file does not exist.',
}
