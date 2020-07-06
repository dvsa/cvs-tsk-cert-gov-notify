export enum TEMPLATEIDS {
  CERTIFICATE_EMAIL = "1b602e0e-b53a-452a-858f-c5831ef3ed70",
  PLATES_EMAIL = "340070f3-5fad-496a-a82e-48a0ec82c274"
}

export enum CERT_TYPE {
  VTG6_VTG7 = "VTG6_VTG7"
}

export enum ERRORS {
  NotifyConfigNotDefined = "The Notify config is not defined in the config file.",
  DynamoDBConfigNotDefined = "DynamoDB config is not defined in the config file.",
  LambdaInvokeConfigNotDefined = "Lambda Invoke config is not defined in the config file.",
  EventIsEmpty = "Event is empty",
  SECRET_ENV_VAR_NOT_EXIST = "SECRET_NAME environment variable does not exist.",
  SECRET_FILE_NOT_EXIST = "The secret file does not exist.",
}
