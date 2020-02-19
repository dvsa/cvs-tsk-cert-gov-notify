export enum TEMPLATEIDS {
  CertificateEmail = "1b602e0e-b53a-452a-858f-c5831ef3ed70",
}

export enum ERRORS {
  NotifyConfigNotDefined = "The Notify config is not defined in the config file.",
  DynamoDBConfigNotDefined = "DynamoDB config is not defined in the config file.",
  LambdaInvokeConfigNotDefined = "Lambda Invoke config is not defined in the config file.",
  EventIsEmpty = "Event is empty",
  SECRET_ENV_VAR_NOT_EXIST = "SECRET_NAME environment variable does not exist.",
  SECRET_FILE_NOT_EXIST = "The secret file does not exist.",
}
